<script setup lang="ts">
// pages/admin/roster.vue
// Only accessible to uploaders. Lists all players in the roster,
// allows editing class/spec/guild, and adding new entries.

import { UButton } from '#components'
import { classIcons } from '@/server/utils/gleagueClassIcons'
import { specIcons } from '@/server/utils/specIcons'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'

const isUploader = await useIsUploader()
if (!isUploader.value) {
  await navigateTo('/')
}

const client = useSupabaseClient()
const toast = useToast()

const BDO_CLASSES = [
  'Warrior', 'Ranger', 'Sorceress', 'Berserker', 'Tamer', 'Musa', 'Maehwa',
  'Valkyrie', 'Kunoichi', 'Ninja', 'Wizard', 'Witch', 'Dark Knight', 'Striker',
  'Mystic', 'Lahn', 'Archer', 'Shai', 'Guardian', 'Hashashin', 'Nova', 'Sage',
  'Corsair', 'Drakania', 'Woosa', 'Maegu', 'Scholar', 'Dosa', 'Deadeye',
  'Wukong', 'Seraph', 'Acher'
]

const BDO_SPECS = [
  'Awakening', 'Succession', 'Scholar', 'Deadeye', 'Shai', 'Seraph','Archer'
]

interface RosterEntry {
  player_name: string
  class: string | null
  spec: string | null
  guild: string | null
}

const roster = ref<RosterEntry[]>([])
const loading = ref(true)
const editingName = ref<string | null>(null)
const classSearch = ref('')
const specSearch = ref('')
const nameSearch = ref('')
const guildSearch = ref('')

// New player form
const newName = ref('')
const newClass = ref('')
const newSpec = ref('')
const newGuild = ref('')
const adding = ref(false)

const filteredClasses = computed(() =>
  BDO_CLASSES.filter(c => c.toLowerCase().includes(classSearch.value.trim().toLowerCase()))
)

const filteredSpecs = computed(() =>
  BDO_SPECS.filter(s => s.toLowerCase().includes(specSearch.value.trim().toLowerCase()))
)

// FIX 1: chain both filters correctly — name first, then guild on top
const filteredRoster = computed(() => {
  let result = roster.value

  if (nameSearch.value.trim()) {
    result = result.filter(r =>
      r.player_name.toLowerCase().includes(nameSearch.value.trim().toLowerCase())
    )
  }

  if (guildSearch.value.trim()) {
    result = result.filter(r =>
      r.guild?.toLowerCase().includes(guildSearch.value.trim().toLowerCase()) ?? false
    )
  }

  return result
})

async function loadRoster() {
  loading.value = true
  const { data, error } = await client
    .from('player_roster')
    .select('player_name, class, spec, guild')
    .order('player_name')

  if (error) {
    toast.add({ title: 'Failed to load roster', color: 'error' })
  } else {
    roster.value = data ?? []
  }
  loading.value = false
}

await loadRoster()

async function saveEntry(entry: RosterEntry) {
  const { error } = await client
    .from('player_roster')
    .upsert({
      player_name: entry.player_name,
      class: entry.class,
      spec: entry.spec,
      guild: entry.guild?.trim() || null,
      updated_at: new Date().toISOString()
    })

  if (error) {
    toast.add({ title: `Failed to save ${entry.player_name}`, color: 'error' })
  } else {
    toast.add({ title: `${entry.player_name} saved`, color: 'success' })
    editingName.value = null
    classSearch.value = ''
    specSearch.value = ''
  }
}

async function addPlayer() {
  if (!newName.value.trim()) return
  adding.value = true
  const entry: RosterEntry = {
    player_name: newName.value.trim(),
    class: newClass.value || null,
    spec: newSpec.value || null,
    guild: newGuild.value.trim() || null,
  }
  const { error } = await client
    .from('player_roster')
    .upsert({ ...entry, updated_at: new Date().toISOString() })

  if (error) {
    toast.add({ title: 'Failed to add player', color: 'error' })
  } else {
    toast.add({ title: `${entry.player_name} added`, color: 'success' })
    roster.value.push(entry)
    roster.value.sort((a, b) => a.player_name.localeCompare(b.player_name))
    newName.value = ''
    newClass.value = ''
    newSpec.value = ''
    newGuild.value = ''
  }
  adding.value = false
}

const draftGuild = ref<string>('')

function toggleEdit(name: string) {
  if (editingName.value === name) {
    editingName.value = null
  } else {
    editingName.value = name
    const entry = roster.value.find(r => r.player_name === name)
    draftGuild.value = entry?.guild ?? ''
  }
  classSearch.value = ''
  specSearch.value = ''
}

async function saveEntryWithDraft(entry: RosterEntry) {
  entry.guild = draftGuild.value.trim() || null
  await saveEntry(entry)
}
</script>

<template>
  <div class="container mx-auto flex flex-col gap-2 px-4 py-4 text-foreground">
    <h1 class="text-2xl font-semibold">Player Roster</h1>

    <!-- Add new player + search bar -->
    <div class="flex flex-col gap-3 justify-between bg-muted p-4 rounded-lg">

      <!-- Top: form fields -->
      <div class="flex flex-wrap gap-3 items-end">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground">Player name</label>
          <input
            v-model="newName"
            class="bg-background border border-border rounded px-2 py-1 text-sm"
            placeholder="e.g. Albaa"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground">Guild</label>
          <input
            v-model="newGuild"
            class="bg-background border border-border rounded px-2 py-1 text-sm"
            placeholder="e.g. Ethereal"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground">Class</label>
          <select v-model="newClass" class="bg-background border border-border rounded px-2 py-1 text-sm">
            <option value="">— none —</option>
            <option v-for="c in BDO_CLASSES" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-muted-foreground">Spec</label>
          <select v-model="newSpec" class="bg-background border border-border rounded px-2 py-1 text-sm">
            <option value="">— none —</option>
            <option v-for="s in BDO_SPECS" :key="s" :value="s">{{ s }}</option>
          </select>
        </div>
        <UButton
          :loading="adding"
          icon="i-lucide-plus"
          label="Add player"
          class="bg-purple-600 hover:bg-purple-700 text-white"
          @click="addPlayer"
        />
      </div>

      <!-- Bottom: search fields -->
      <div class="flex flex-row gap-3">
        <div class="flex flex-col gap-1">
          <!-- FIX 2: correct label -->
          <label class="text-xs text-muted-foreground">Search player</label>
          <div class="relative">
            <i class="i-lucide-search absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              v-model="nameSearch"
              class="bg-background border border-border rounded px-2 py-1 pl-7 text-sm w-48"
              placeholder="Filter by name..."
            />
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <!-- FIX 2: correct label -->
          <label class="text-xs text-muted-foreground">Search guild</label>
          <div class="relative">
            <i class="i-lucide-search absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              v-model="guildSearch"
              class="bg-background border border-border rounded px-2 py-1 pl-7 text-sm w-48"
              placeholder="Filter by guild..."
            />
          </div>
        </div>
      </div>

    </div>

    <!-- Roster table -->
    <div
      v-if="!loading"
      class="bg-zinc-800/50 text-sm backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden"
    >
      <DataTable
        :value="filteredRoster"
        :paginator="filteredRoster.length > 10"
        :rows="10"
        :rowHover="true"
        sortField="player_name"
        :sortOrder="1"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} players"
        class="roster-table"
      >
        <!-- Player -->
        <Column field="player_name" header="Player" sortable style="width: 25%">
          <template #body="{ data }">
            <span class="text-white font-medium">{{ data.player_name }}</span>
          </template>
        </Column>

        <!-- Guild -->
        <Column field="guild" header="Guild" sortable style="width: 20%">
          <template #body="{ data }">
            <div v-if="editingName !== data.player_name">
              <span v-if="data.guild" class="text-zinc-300">{{ data.guild }}</span>
              <span v-else class="text-zinc-500">—</span>
            </div>
            <div v-else>
              <input
                v-model="draftGuild"
                class="bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-xs w-full text-white"
                placeholder="Guild name..."
              />
            </div>
          </template>
        </Column>

        <!-- Class -->
        <Column field="class" header="Class" sortable style="width: 25%">
          <template #body="{ data }">
            <div v-if="editingName !== data.player_name" class="flex items-center gap-2">
              <div v-if="data.class && classIcons[data.class]" class="relative group inline-flex">
                <img :src="classIcons[data.class]" :alt="data.class" class="w-8 h-8 object-contain" />
                <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {{ data.class }}
                </div>
              </div>
              <span v-else class="text-zinc-500">—</span>
            </div>
            <div v-else class="flex flex-col gap-1 min-w-[120px]">
              <input
                class="bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-xs w-full text-white"
                placeholder="Search class..."
                @input="(e) => classSearch = (e.target as HTMLInputElement).value"
              />
              <select
                class="bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-xs w-full text-white"
                :value="data.class ?? ''"
                :size="Math.max(2, Math.min(filteredClasses.length, 5))"
                @change="(e) => data.class = (e.target as HTMLSelectElement).value"
              >
                <option v-for="c in filteredClasses" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </template>
        </Column>

        <!-- Spec -->
        <Column field="spec" header="Spec" sortable style="width: 20%">
          <template #body="{ data }">
            <div v-if="editingName !== data.player_name" class="flex items-center gap-2">
              <div v-if="data.spec && specIcons[data.spec]" class="relative group inline-flex">
                <img :src="specIcons[data.spec]" :alt="data.spec" class="w-8 h-8 object-contain" />
                <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                  {{ data.spec }}
                </div>
              </div>
              <span v-else class="text-zinc-500">—</span>
            </div>
            <div v-else class="flex flex-col gap-1 min-w-[110px]">
              <input
                class="bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-xs w-full text-white"
                placeholder="Search spec..."
                @input="(e) => specSearch = (e.target as HTMLInputElement).value"
              />
              <select
                class="bg-zinc-700 border border-zinc-600 rounded px-1 py-0.5 text-xs w-full text-white"
                :value="data.spec ?? ''"
                :size="Math.max(2, Math.min(filteredSpecs.length, 5))"
                @change="(e) => data.spec = (e.target as HTMLSelectElement).value"
              >
                <option v-for="s in filteredSpecs" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="" style="width: 10%">
          <template #body="{ data }">
            <UButton
              variant="ghost"
              size="xs"
              :icon="editingName === data.player_name ? 'i-lucide-check' : 'i-lucide-pencil'"
              :class="['cursor-pointer', editingName === data.player_name ? 'text-green-500' : 'text-muted-foreground']"
              @click="editingName === data.player_name ? saveEntryWithDraft(data) : toggleEdit(data.player_name)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <div v-else class="text-muted-foreground">Loading roster...</div>
  </div>
</template>
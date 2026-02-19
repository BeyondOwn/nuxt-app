<script setup lang="ts">
import { UButton } from '#components';
import { formatNumberWithCommas } from '@/server/utils/formatNumberWithCommas';
import { classIcons } from '@/server/utils/gleagueClassIcons';
import { specIcons } from '@/server/utils/specIcons';
import type { Database } from '@/types/supabase';
import type { TableColumn } from '@nuxt/ui';

const myGuild = ref('Insecure');

const user = useSupabaseUser();
const nuxtApp = useNuxtApp();
const isUploader = await useIsUploader();

const BDO_CLASSES = [
  'Warrior', 'Ranger', 'Sorceress', 'Berserker', 'Tamer', 'Musa', 'Maehwa',
  'Valkyrie', 'Kunoichi', 'Ninja', 'Wizard', 'Witch', 'Dark Knight', 'Striker',
  'Mystic', 'Lahn', 'Archer', 'Shai', 'Guardian', 'Hashashin', 'Nova', 'Sage',
  'Corsair', 'Drakania', 'Woosa', 'Maegu', 'Scholar', 'Dosa', 'Deadeye',
  'Wukong', 'Seraph', 'Acher'
];

const BDO_SPECS = [
  'Awakening', 'Succession', 'Scholar', 'Deadeye', 'Shai', 'Seraph','Archer'
];

interface tableDataInt {
  id: number
  name: string | null
  kd: string | null
  debuffs: number | null
  dealt: number | null
  taken: number | null
  healed: number | null
  class: string | null
  spec: string | null
}

const toast = useToast();
const route = useRoute();
const gameId = route.params.slug;
const loading = ref(true);
const victoryTableData = ref<tableDataInt[]>([]);
const defeatTableData = ref<tableDataInt[]>([]);

const editingRowId = ref<number | null>(null);
const savingRowId = ref<number | null>(null);
const classSearch = ref('');
const specSearch = ref('');

const filteredClasses = computed(() =>
  BDO_CLASSES.filter(c => c.toLowerCase().includes(classSearch.value.trim().toLowerCase()))
);

const filteredSpecs = computed(() =>
  BDO_SPECS.filter(s => s.toLowerCase().includes(specSearch.value.trim().toLowerCase()))
);

const { data: queryParams } = await useAsyncData(
  `game${gameId}`,
  () => $fetch<Database['public']['Tables']['games']['Row']>('/api/get-game', { method: 'POST', body: gameId }),
  {
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    }
  }
);

const { data: stats, error } = await useAsyncData(
  `stats${gameId}`,
  () => $fetch<Database['public']['Tables']['game_players']['Row'][]>('/api/get-player-stats', { method: 'POST', body: { gameId: gameId } }),
  {
    getCachedData(key) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    }
  }
);

if (stats.value) {
  stats.value?.map((stat) => {
    const row: tableDataInt = {
      id: stat.id,
      name: stat.player_name,
      kd: stat.kd,
      debuffs: stat.debuffs,
      dealt: stat.dealt,
      taken: stat.taken,
      healed: stat.healed,
      class: stat.class ?? null,
      spec: stat.spec ?? null,
    };
    if (stat.team_type === 'victory') {
      victoryTableData.value.push(row);
    } else {
      defeatTableData.value.push(row);
    }
  });
}

if (error) console.log(error.value);
loading.value = false;

async function saveClassSpec(row: tableDataInt) {
  savingRowId.value = row.id;
  try {
    await $fetch('/api/update-player-class', {
      method: 'POST',
      body: { playerId: row.id, class: row.class, spec: row.spec }
    });
    toast.add({ title: `${row.name} updated`, color: 'success' });
  } catch (e) {
    toast.add({ title: 'Failed to save', color: 'error' });
  } finally {
    savingRowId.value = null;
  }
}

function toggleEdit(rowId: number) {
  if (editingRowId.value === rowId) {
    editingRowId.value = null;
    classSearch.value = '';
    specSearch.value = '';
  } else {
    editingRowId.value = rowId;
    classSearch.value = '';
    specSearch.value = '';
  }
}

function sortHeader(label: string, column: any) {
  const isSorted = column.getIsSorted();
  return h(UButton, {
    variant: 'ghost',
    label,
    icon: isSorted
      ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow')
      : 'i-lucide-arrow-up-down',
    class: '-mx-1 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600 px-1',
    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
  });
}

function iconWithTooltip(src: string, alt: string, tooltip: string) {
  return h('div', { class: 'relative group' }, [
    h('img', { src, alt, class: 'w-9 h-9 object-contain' }),
    h('div', {
      class: 'absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10',
    }, tooltip),
  ]);
}

const columns: TableColumn<tableDataInt, unknown>[] = [
  {
    id: 'player',
    accessorKey: 'name',
    header: () => h('div', { class: 'text-base' }, 'Player'),
    meta: { class: { td: 'text-left' } },
    cell: ({ row }) => {
      const rowData = row.original as tableDataInt;
      const isEditing = editingRowId.value === rowData.id;

      const classIconPath = rowData.class ? classIcons[rowData.class] : null;
      const specIconPath = rowData.spec ? specIcons[rowData.spec] : null;

      // Normal view: PlayerName [ClassIcon] [SpecIcon]
      const nameWithIcons = h('div', { class: 'flex items-center gap-2' }, [
        classIconPath
          ? iconWithTooltip(classIconPath, rowData.class ?? '', rowData.class ?? '')
          : h('span', { class: 'text-muted-foreground text-xs' }, '—'),
        specIconPath
          ? iconWithTooltip(specIconPath, rowData.spec ?? '', rowData.spec ?? '')
          : h('span', { class: 'text-muted-foreground text-xs' }, '—'),
        h('span', { class: 'text-base font-medium max-w-[95px] overflow-hidden text-ellipsis whitespace-nowrap' }, rowData.name ?? ''),
      ]);

      if (!isEditing || !isUploader.value) return nameWithIcons;

      // Edit mode: name+icons row, then class+spec dropdowns side by side below
      return h('div', { class: 'flex flex-col gap-2' }, [
        nameWithIcons,
        h('div', { class: 'flex gap-2' }, [
          // Class dropdown
          h('div', { class: 'flex flex-col gap-1 flex-1 min-w-[110px]' }, [
            h('input', {
              class: 'bg-muted border border-border rounded px-1 py-0.5 text-xs w-full',
              placeholder: 'Search class...',
              onInput: (e: Event) => { classSearch.value = (e.target as HTMLInputElement).value; }
            }),
            h('select', {
              class: 'bg-muted border border-border rounded px-1 py-0.5 text-xs w-full',
              value: rowData.class ?? '',
              size: Math.max(2, Math.min(filteredClasses.value.length, 5)),
              onChange: async (e: Event) => {
                rowData.class = (e.target as HTMLSelectElement).value;
                await saveClassSpec(rowData);
              }
            }, filteredClasses.value.map(c =>
              h('option', { value: c, selected: rowData.class === c }, c)
            ))
          ]),
          // Spec dropdown
          h('div', { class: 'flex flex-col gap-1 flex-1 min-w-[100px]' }, [
            h('input', {
              class: 'bg-muted border border-border rounded px-1 py-0.5 text-xs w-full',
              placeholder: 'Search spec...',
              onInput: (e: Event) => { specSearch.value = (e.target as HTMLInputElement).value; }
            }),
            h('select', {
              class: 'bg-muted border border-border rounded px-1 py-0.5 text-xs w-full',
              value: rowData.spec ?? '',
              size: Math.max(2, Math.min(filteredSpecs.value.length, 5)),
              onChange: async (e: Event) => {
                rowData.spec = (e.target as HTMLSelectElement).value;
                await saveClassSpec(rowData);
              }
            }, filteredSpecs.value.map(s =>
              h('option', { value: s, selected: rowData.spec === s }, s)
            ))
          ]),
        ])
      ]);
    }
  },
  {
    id: 'kd',
    accessorKey: 'kd',
    header: ({ column }) => sortHeader('K/D', column),
    cell: ({ row }) => h('div', { class: 'text-base text-center' }, `${row.getValue('kd')}`),
    sortingFn: (rowA, rowB, columnId) => {
      const aString = rowA.getValue(columnId) as string;
      const bString = rowB.getValue(columnId) as string;
      const aValue = parseInt(aString.split('/')[0], 10);
      const bValue = parseInt(bString.split('/')[0], 10);
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  },
  {
    accessorKey: 'debuffs',
    header: ({ column }) => sortHeader('CC', column),
    cell: ({ row }) => h('div', { class: 'text-base text-center' }, row.getValue('debuffs'))
  },
  {
    id: 'dealt',
    accessorKey: 'dealt',
    header: ({ column }) => sortHeader('Dealt', column),
    cell: ({ row }) => h('div', { class: 'text-base text-center' }, formatNumberWithCommas(row.getValue('dealt'))),
  },
  {
    accessorKey: 'taken',
    header: ({ column }) => sortHeader('Taken', column),
    cell: ({ row }) => h('div', { class: 'text-base text-center' }, formatNumberWithCommas(row.getValue('taken')))
  },
  {
    accessorKey: 'healed',
    header: ({ column }) => sortHeader('Healed', column),
    cell: ({ row }) => h('div', { class: 'text-base text-center' }, formatNumberWithCommas(row.getValue('healed')))
  },
  ...(isUploader.value ? [{
    id: 'edit',
    header: () => h('div', ''),
    cell: ({ row }: { row: any }) => {
      const rowData = row.original as tableDataInt;
      const isEditing = editingRowId.value === rowData.id;
      const isSaving = savingRowId.value === rowData.id;

      return h(UButton, {
        variant: 'ghost',
        size: 'xs',
        icon: isSaving
          ? 'i-lucide-loader-circle'
          : isEditing
            ? 'i-lucide-check'
            : 'i-lucide-pencil',
        class: `cursor-pointer ${isEditing ? 'text-green-500' : 'text-muted-foreground'} ${isSaving ? 'animate-spin' : ''}`,
        onClick: () => toggleEdit(rowData.id),
      });
    }
  }] : [])
];

const tableUI = 'even:bg-card odd:bg-muted text-center';
const tableHead = 'bg-purple-500 dark:bg-purple-700 py-0 h-[52px] text-center first:text-left';
const td = 'text-foreground py-3 px-4';

const sortingVictory = ref([{ id: 'dealt', desc: true }]);
const sortingDefeat = ref([{ id: 'dealt', desc: true }]);
</script>

<template>
  <div class="container mx-auto flex flex-col w-full text-foreground">
    <div v-if="queryParams"
      class="text-2xl font-semibold flex flex-row gap-4 relative px-4 py-2">
      <div @click="$router.back"
        class="h-8 w-8 rounded-xl absolute -left-10 justify-items-center place-items-center hover:bg-accent">
        <UIcon size="32" name="material-symbols:arrow-back" />
      </div>
      <span class="text-error" v-if="myGuild == queryParams?.defeat_team_name">
        Defeat vs {{ queryParams?.victory_team_name }}
      </span>
      <span class="text-primary-nuxt" v-else>
        Victory vs {{ queryParams?.defeat_team_name }}
      </span>
      <span>Score: {{ queryParams?.victory_team_score }} - {{ queryParams?.defeat_team_score }}</span>
      <span class="ml-auto">{{ queryParams?.date_hour }}</span>
    </div>

    <div v-if="!loading" class="flex flex-col 2xl:flex-row mt-2 gap-4 px-4 pb-4">
      <div class="flex flex-col min-w-0 flex-1">
        <div class="w-full flex flex-col items-center bg-purple-500 dark:bg-purple-700">
          <span class="font-bold text-green-500">[Victory] {{ queryParams?.victory_team_name }}</span>
        </div>
        <div class="overflow-x-auto w-full">
          <UTable v-model:sorting="sortingVictory" :ui="{ td: td, tr: tableUI, th: tableHead }"
            class="w-full font-light" :data="victoryTableData" :columns="columns" />
        </div>
      </div>

      <div class="flex flex-col min-w-0 flex-1">
        <div class="w-full flex flex-col items-center bg-purple-500 dark:bg-purple-700">
          <span class="font-bold text-red-500">[Defeat] {{ queryParams?.defeat_team_name }}</span>
        </div>
        <div class="overflow-x-auto w-full">
          <UTable v-model:sorting="sortingDefeat" :ui="{ td: td, tr: tableUI, th: tableHead }"
            class="w-full font-light" :data="defeatTableData" :columns="columns" />
        </div>
      </div>
    </div>
  </div>
</template>
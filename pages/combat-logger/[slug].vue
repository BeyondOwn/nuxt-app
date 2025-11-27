<script setup lang="ts">
import type { UUID } from 'crypto';


const nuxtApp = useNuxtApp();
const route = useRoute();
const gameId = route.params.slug;
const selectedGuild = ref<string | null>(null);
const searchName = ref();
const selectedClass = ref();

interface CombatLogs{
    id:UUID,
    title:string,
    created_at:string,
    guild:string,
    type:string,
    duration:number | null,
    total_guilds:number | null,
    total_players:number | null
}

interface PlayerStat {
  id: number;
  family_name: string;
  kills: number;
  deaths: number;
  game_id: string;
  guild: string;
  class:string;
  type:string,
  title:string,
}

interface GeneralStats {
  players: PlayerStat[];
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  playerCount: number;
}

interface GuildStat {
  guild: string;
  players: PlayerStat[];
  totalKills: number;
  totalDeaths: number;
  kdRatio: number;
  playerCount: number;
}

interface CombatLogResponse {
  generalStats: GeneralStats;
  guildStats: GuildStat[];
  combatLogData: CombatLogs[]; 
}

const { data } = await useAsyncData(
    `combatLog${gameId}`,
    () => $fetch<CombatLogResponse>('/api/get-combat-logs-stats', { method: 'POST', body: { gameId:gameId } }),
    {
        getCachedData(key) {
            return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
        }
    }
);
const combatLogData = ref(data.value?.combatLogData[0]);
const mainTableData = ref(data.value?.generalStats.players || []);
const tableKey = ref(0);

const onGuildClick = (guild:GuildStat) => {
    if(selectedGuild.value === guild.guild && data.value){
        mainTableData.value = data.value?.generalStats.players;
        selectedGuild.value = null;
    } else {
        mainTableData.value = guild.players;
        selectedGuild.value = guild.guild;
    }
    tableKey.value++;
}

const getKDColor = (kd: number) => {
    if (kd >= 2) return 'text-emerald-400';
    if (kd >= 1) return 'text-green-400';
    if (kd >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
}

// First filter by name
const nameFilteredData = computed(() => {
  if (!searchName.value) {
    return mainTableData.value;
  }
  return mainTableData.value.filter((player) => 
    player.family_name.toLowerCase().includes(searchName.value.toLowerCase())
  );
});

// Get unique classes from name-filtered data
const classOptions = computed(() => {
  const uniqueClasses = [...new Set(nameFilteredData.value.map(player => player.class))];
  return [
    { Class: 'All' },
    ...uniqueClasses.map(cls => ({ Class: cls }))
  ];
});

// Then filter by class
const filteredTableData = computed(() => {
  let filtered = nameFilteredData.value;
  
  // Filter by class (skip if "All" is selected)
  if (selectedClass.value && selectedClass.value.Class !== 'All') {
    filtered = filtered.filter((player) => 
      player.class === selectedClass.value.Class
    );
  }
  
  return filtered;
});

// Reset class selection when search changes and current class is no longer available
watch(searchName, () => {
  if (selectedClass.value && selectedClass.value.Class !== 'All') {
    const availableClasses = classOptions.value.map(opt => opt.Class);
    if (!availableClasses.includes(selectedClass.value.Class)) {
      selectedClass.value = null;
    }
  }
});
</script>

<template>
    <div class="w-full min-h-[calc(100vh-40px)] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-6 px-4 overflow-auto ">
        <div class="container mx-auto">
            <!-- Header Section -->
            <div class="mb-3">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <i class="pi pi-flag text-white text-2xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center justify-center gap-3 ">
                            <h1 class="text-4xl font-bold text-white tracking-tight font-sans ">
                                {{data?.generalStats.players[0].title}}
                            </h1>
                            <span :class="[data?.generalStats.players[0].type === 'GvG' 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
                                    'px-3 py-1 rounded-full text-sm font-semibold border-2 bg-orange-500/20 text-orange-300 border-orange-500/50']">
                                {{data?.generalStats.players[0].type}}
                            </span>
                        </div>
                        <!-- <p class="text-zinc-400 mt-1">
                             • Detailed player and guild performance breakdown
                        </p> -->
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6  ">
                <!-- Left Sidebar - Guild Cards -->
                <div class="lg:col-span-4 xl:col-span-2 ">
                    <div class=" top-4">
                        <div class="mb-4 flex items-center justify-between">
                            <h2 class="text-xl font-semibold text-white">Guilds</h2>
                            <span class="text-sm text-zinc-400">{{ data?.guildStats.length }} total</span>
                        </div>
                        
                        <div class="space-y-3  max-h-screen overflow-y-auto pr-2 custom-scrollbar">
                            <!-- All Players Card -->
                            <div 
                                @click="onGuildClick({ guild: 'All Players', players: data?.generalStats.players || [], totalKills: 0, totalDeaths: 0, kdRatio: 0, playerCount: 0 })"
                                :class="[
                                    'group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300',
                                    'bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm',
                                    'border-2  hover:shadow-lg hover:shadow-emerald-900/20',
                                    selectedGuild === null 
                                        ? 'border-emerald-500 shadow-lg shadow-emerald-900/30' 
                                        : 'border-zinc-700/50 hover:border-emerald-500/50'
                                ]"
                            >
                                <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                                <div class="relative">
                                    <div class="flex items-center gap-2 mb-3">
                                        <i class="pi pi-globe text-emerald-400 text-lg"></i>
                                        <h3 class="font-bold text-white text-lg">All Players</h3>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">Players</div>
                                            <div class="text-lg font-semibold text-blue-400">{{ data?.generalStats.playerCount }}</div>
                                        </div>
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">Kills</div>
                                            <div class="text-lg font-semibold text-green-400">{{ data?.generalStats.totalKills }}</div>
                                        </div>
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">Deaths</div>
                                            <div class="text-lg font-semibold text-red-400">{{ data?.generalStats.totalDeaths }}</div>
                                        </div>
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">K/D</div>
                                            <div :class="['text-lg font-semibold', getKDColor(data?.generalStats.kdRatio || 0)]">
                                                {{ data?.generalStats.kdRatio.toFixed(2) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Guild Cards -->
                            <div 
                                v-for="(guild, index) in data?.guildStats" 
                                :key="index"
                                @click="onGuildClick(guild)"
                                :class="[
                                    'group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300',
                                    'bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm',
                                    'border-2  hover:shadow-lg hover:shadow-purple-900/20',
                                    selectedGuild === guild.guild 
                                        ? 'border-purple-500 shadow-lg shadow-purple-900/30' 
                                        : 'border-zinc-700/50 hover:border-purple-500/50'
                                ]"
                            >
                                <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
                                <div class="relative">
                                    <div class="flex items-center gap-2 mb-3">
                                        <i class="pi pi-users text-purple-400 text-lg"></i>
                                        <h3 class="font-bold text-white text-lg">{{ guild.guild }}</h3>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">Members</div>
                                            <div class="text-lg font-semibold text-blue-400">{{ guild.playerCount }}</div>
                                        </div>
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">Kills</div>
                                            <div class="text-lg font-semibold text-green-400">{{ guild.totalKills }}</div>
                                        </div>
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">Deaths</div>
                                            <div class="text-lg font-semibold text-red-400">{{ guild.totalDeaths }}</div>
                                        </div>
                                        <div class="bg-zinc-900/60 rounded-lg p-2">
                                            <div class="text-sm text-zinc-400 mb-1">K/D</div>
                                            <div :class="['text-lg font-semibold', getKDColor(guild.kdRatio)]">
                                                {{ guild.kdRatio.toFixed(2) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Content - Player Table -->
                <div class="lg:col-span-8 xl:col-span-10 ">
                    <!-- Stats Header -->
                    <div class="flex justify-end items-center gap-3  rounded-lg ">
                                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <i class="pi pi-address-book text-white text-lg"></i>
                                </div>
                                <div>
                                    <div class="text-2xl font-bold text-white">{{ combatLogData?.total_guilds }}</div>
                                    <div class="text-xs text-zinc-400 uppercase tracking-wide">Guilds</div>
                                </div>
                                <!-- Players Stat -->
                            <div class="flex items-center gap-3  rounded-lg p-3">
                                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                    <i class="pi pi-users text-white text-lg"></i>
                                </div>
                                <div>
                                    <div class="text-2xl font-bold text-white">{{ combatLogData?.total_players }}</div>
                                    <div class="text-xs text-zinc-400 uppercase tracking-wide">Players</div>
                                </div>
                            </div>

                            <!-- Duration Stat -->
                            <div class="flex items-center gap-3  rounded-lg p-3">
                                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                    <i class="pi pi-clock text-white text-lg"></i>
                                </div>
                                <div>
                                    <div class="text-2xl font-bold text-white">{{ combatLogData?.duration }}</div>
                                    <div class="text-xs text-zinc-400 uppercase tracking-wide">Minutes</div>
                                </div>
                            </div>
                            </div>
                    <div class=" flex items-center justify-between">
                        <div class="flex justify-between w-full">
                            <div class="flex gap-2">
                            <h2 class="text-2xl font-bold text-white">
                                {{ selectedGuild || 'All Players' }}
                            </h2>
                            <p class="text-sm text-zinc-400 mt-1">
                                ({{ mainTableData.length }} {{ mainTableData.length === 1 ? 'player' : 'players' }})
                            </p>
                        </div>
                        
                            
                            <div class="flex gap-2">
                                <IconField class="w-[250px]">
                    <InputIcon class="pi pi-search" />
                    <InputText  class="w-[250px]" v-model="searchName" placeholder="Search players..." />
                    <InputIcon 
                    v-if="searchName" 
                    class="pi pi-times cursor-pointer" 
                    style="right: 0.75rem; left: auto;"
                    @click="searchName = ''" 
                    />
                </IconField>

                <Select v-model="selectedClass" :options="classOptions" optionLabel="Class" 
                placeholder="Class" class="w-full md:w-56" />
                            </div>
                        </div>
                    </div>

                <div class="flex justify-end gap-2 mb-2">
                
                </div>

                    <!-- Data Table -->
                    <div class="bg-zinc-800/50 text-sm backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden max-h-screen min-w-full">
                        <DataTable 
                            :key="tableKey" 
                            :value="filteredTableData" 
                            :paginator="filteredTableData.length > 15"
                            :rows="15"
                            class="combat-stats-table "
                            :rowHover="true"
                            sortField="kills"
                            :sortOrder="-1"
                            :totalRecords="filteredTableData.length"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                        >
                            
                            <Column field="class" header="Class" sortable style="width: 20%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <ClassIcon :class="slotProps.data.class.replace(/\s/g, '_')"></ClassIcon>
                                        <span class="text-zinc-300">{{ slotProps.data.class }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="family_name" header="Player" sortable style="width: 25%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <!-- <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                            {{ slotProps.data.family_name.charAt(0).toUpperCase() }}
                                        </div> -->
                                        <span class="text-white font-medium">{{ slotProps.data.family_name }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="kills" header="Kills" sortable style="width: 15%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <!-- <i class="pi pi-flag text-green-500 text-sm"></i> -->
                                        <span class="text-green-400 font-semibold">{{ slotProps.data.kills }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="deaths" header="Deaths" sortable style="width: 15%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <!-- <i class="pi pi-times-circle text-red-500 text-sm"></i> -->
                                        <span class="text-red-400 font-semibold">{{ slotProps.data.deaths }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="guild" header="Guild" sortable style="width: 25%">
                                <template #body="slotProps">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        {{ slotProps.data.guild }}
                                    </span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: rgb(39, 39, 42);
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgb(63, 63, 70);
    border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgb(82, 82, 91);
}

/* DataTable Styles */
:deep(.p-datatable) {
    background: transparent;
    width: 100%;
}

:deep(.p-datatable-header) {
    background: transparent;
    border: none;
    padding: 1rem;
}

:deep(.p-datatable-thead > tr > th) {
    background: rgb(17, 17, 19);
    color: rgb(161, 161, 170);
    border: none;
    padding: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

:deep(.p-datatable-tbody > tr) {
    background: rgb(28, 28, 31);
    border-bottom: 1px solid rgb(39, 39, 42);
    transition: all 0.2s ease;
}

:deep(.p-datatable-tbody > tr:hover) {
    background: rgb(39, 39, 42);
}

:deep(.p-datatable-tbody > tr > td) {
    border: none;
    padding: 0.6rem;
    color: rgb(212, 212, 216);
    border-bottom: 1px solid rgba(255, 255, 255,0.2);
}

:deep(.p-paginator) {
    background: rgb(24, 24, 27);
    border: none;
    padding: 1rem;
    color: rgb(161, 161, 170);
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
    background: rgb(52, 211, 153);
    border-color: rgb(52, 211, 153);
    color: rgb(6, 78, 59);
}
</style>
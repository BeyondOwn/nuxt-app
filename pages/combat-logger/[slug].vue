<script setup lang="ts">
    import type { Database } from '@/types/supabase';
import type { UUID } from 'crypto';
import Chart from 'primevue/chart';
    
    
    const nuxtApp = useNuxtApp();
    const route = useRoute();
    const gameId = route.params.slug;
    const selectedGuild = ref<string | null>(null);
    const searchName = ref();
    const selectedClass = ref();
    const killedPlayers = ref();
    const diedTo = ref();
    
    // New refs for the kill/death matrix section
    const selectedEnemyGuild = ref<string | null>(null);
    const selectedPlayerName = ref<string | null>(null);
    
    
    
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
      join_duration:number;
      performance:number;
      game_id: string;
      kd:number;
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
    
    const { data:mainLogData } = await useAsyncData(
        `mainLog${gameId}`,
        () => $fetch<Database['public']['Tables']['combat_logs']['Row'][]>('/api/get-combat-log', { method: 'POST', body: { gameId:gameId } }),
        {
            getCachedData(key) {
                return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
            }
        }
    );
    
    console.log("Main: ",JSON.parse(JSON.stringify(mainLogData.value?.[0].kill_matrix)));
    const killMatrix = JSON.parse(JSON.stringify(mainLogData.value?.[0].kill_matrix));
    const deathMatrix = JSON.parse(JSON.stringify(mainLogData.value?.[0].death_matrix));
    
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
    
    const totalPlayers = computed(()=>{
        let total_players=0;
    
        data.value?.guildStats.every(g=> total_players +=g.playerCount);
        return total_players;
    })
    
    const chartDataTopPerformers = computed(() => {
      const topPlayers = [...filteredTableData.value]
        .sort((a, b) => b.performance - a.performance)
        .slice(0, 10);
    
      return {
        labels: topPlayers.map(p => p.family_name),
        datasets: [
          {
            backgroundColor: '#a855f7',
            borderColor: '#a855f7',
            data: topPlayers.map(p => p.performance)
          }
        ]
      };
    });
    
    const chartDataBottomPerformers = computed(() => {
      const topPlayers = [...filteredTableData.value]
        .sort((a, b) => a.performance - b.performance)
        .slice(0, 10);
    
      return {
        labels: topPlayers.map(p => p.family_name),
        datasets: [
          {
            backgroundColor: '#a855f7',
            borderColor: '#a855f7',
            data: topPlayers.map(p => p.performance)
          }
        ]
      };
    });
    
    const BarchartOptions = ref({
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      borderRadius:8,
      plugins:{
        legend:{
            display:false
        }
      }
    });
    
    const chartDataGuildDistribution = ref({
      labels: data.value?.guildStats.map(g=>g.guild),
      datasets: [
        {
            backgroundColor: [
            '#2563eb',
            '#4f46e5',
            '#7c3aed',
            '#9333ea',
            '#c026d3',
            '#db2777',
            '#dc2626',
            '#ea580c',
            '#d97706',
            '#0d9488',
            '#0891b2',
            '#475569',
            '#52525b',
            '#57534e',
            '#78716c',
            '#0284c7',
            ],
          borderColor: '#06b6d4',
          data: data.value?.guildStats.map(g=>g.playerCount)
        },
      ]
    });
    
    const doghnutChartOptions = ref({
      plugins:{
        legend:{
            labels:{
                    color:'white'
            }
        },
        cutout:'40%',
      },
      tooltip:{
        enbled:true
      }
    });
    
    const centerTextPlugin = {
      id: 'centerText',
      beforeDraw: (chart:any) => {
        const { width, height, ctx } = chart;
        ctx.restore();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        
        ctx.font = 'bold 2em sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(totalPlayers.value || 0, width / 2, height / 2 - 10);
        
        ctx.font = '1.2em  sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText('Total Players', width / 2, height / 2 + 20);
        
        ctx.save();
      }
    };
    
    const getPlayerGuild = (playerName: string): string | null => {
        const player = data.value?.generalStats.players.find(p => p.family_name === playerName);
        return player?.guild || null;
    };

    const getPlayerStats = (playerName: string) => {
        const player = mainTableData.value.find(p => p.family_name === playerName);
        return player ? {
            kills: player.kills,
            deaths: player.deaths,
            kd: player.kd
        } : { kills: 0, deaths: 0, kd: 0 };
    };

    const mainGuild = computed(() => mainLogData.value?.[0]?.guild || null);

    const enemyGuildOptions = computed(() => {
        if (!data.value?.guildStats || !mainGuild.value) return [];
        return data.value.guildStats
            .map(g => g.guild)
            .filter(guild => guild !== mainGuild.value)
            .sort();
    });

    const alliesData = computed(() => {
        if (!mainGuild.value) return [];
        return Object.keys(killMatrix).filter(name => {
            const guild = getPlayerGuild(name);
            return guild === mainGuild.value;
        }).sort();
    });

    const enemiesData = computed(() => {
        if (!mainGuild.value) return [];
        let enemies = Object.keys(killMatrix).filter(name => {
            const guild = getPlayerGuild(name);
            return guild !== mainGuild.value;
        });
        if (selectedEnemyGuild.value) {
            enemies = enemies.filter(name => {
                const guild = getPlayerGuild(name);
                return guild === selectedEnemyGuild.value;
            });
        }
        return enemies.sort();
    });

    const onPlayerSelect = (playerName: string) => {
        selectedPlayerName.value = playerName;
        killedPlayers.value = killMatrix[playerName];
        diedTo.value = deathMatrix[playerName];
    };

    const matrixKillsFilter = ref<'asc' | 'desc' | null>(null);
    const matrixDeathsFilter = ref<'asc' | 'desc' | null>(null);
    const matrixKDFilter = ref<'asc' | 'desc' | null>(null);

    const onEnemyGuildSelect = (guild: string) => {
        if (guild === selectedEnemyGuild.value) {
            selectedEnemyGuild.value = null;
        } else {
            selectedEnemyGuild.value = guild;
        }
    };

    const sortPlayers = (players: string[]) => {
        const sorted = [...players];
        if (matrixKillsFilter.value) {
            sorted.sort((a, b) => {
                const aStats = getPlayerStats(a);
                const bStats = getPlayerStats(b);
                return matrixKillsFilter.value === 'desc' 
                    ? bStats.kills - aStats.kills 
                    : aStats.kills - bStats.kills;
            });
        } else if (matrixDeathsFilter.value) {
            sorted.sort((a, b) => {
                const aStats = getPlayerStats(a);
                const bStats = getPlayerStats(b);
                return matrixDeathsFilter.value === 'desc' 
                    ? bStats.deaths - aStats.deaths 
                    : aStats.deaths - bStats.deaths;
            });
        } else if (matrixKDFilter.value) {
            sorted.sort((a, b) => {
                const aStats = getPlayerStats(a);
                const bStats = getPlayerStats(b);
                return matrixKDFilter.value === 'desc' 
                    ? bStats.kd - aStats.kd 
                    : aStats.kd - bStats.kd;
            });
        }
        return sorted;
    };

    const toggleKillsSort = () => {
        if (!matrixKillsFilter.value) {
            matrixKillsFilter.value = 'desc';
        } else if (matrixKillsFilter.value === 'desc') {
            matrixKillsFilter.value = 'asc';
        } else {
            matrixKillsFilter.value = null;
        }
        matrixDeathsFilter.value = null;
        matrixKDFilter.value = null;
    };

    const toggleDeathsSort = () => {
        if (!matrixDeathsFilter.value) {
            matrixDeathsFilter.value = 'desc';
        } else if (matrixDeathsFilter.value === 'desc') {
            matrixDeathsFilter.value = 'asc';
        } else {
            matrixDeathsFilter.value = null;
        }
        matrixKillsFilter.value = null;
        matrixKDFilter.value = null;
    };

    const toggleKDSort = () => {
        if (!matrixKDFilter.value) {
            matrixKDFilter.value = 'desc';
        } else if (matrixKDFilter.value === 'desc') {
            matrixKDFilter.value = 'asc';
        } else {
            matrixKDFilter.value = null;
        }
        matrixKillsFilter.value = null;
        matrixDeathsFilter.value = null;
    };

    const sortedKilledPlayers = computed(() => {
        if (!killedPlayers.value) return [];
        const list: { name: string, count: number }[] = [];
        Object.entries(killedPlayers.value).forEach(([familyName, innerObj]) => {
            Object.entries(innerObj as Record<string, number>).forEach(([name, count]) => {
                list.push({ name, count });
            });
        });
        return list.sort((a, b) => b.count - a.count);
    });

    const sortedDiedTo = computed(() => {
        if (!diedTo.value) return [];
        const list: { name: string, count: number }[] = [];
        Object.entries(diedTo.value).forEach(([familyName, innerObj]) => {
            Object.entries(innerObj as Record<string, number>).forEach(([name, count]) => {
                list.push({ name, count });
            });
        });
        return list.sort((a, b) => b.count - a.count);
    });
        
</script>
    
<template>
    <div class="w-full min-h-[calc(100vh-40px)] py-6 px-4 overflow-auto">
        <div class="container mx-auto">
            <!-- Header Section -->
            <div class="mb-3">
                <div class="flex items-center gap-4 mb-3">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                        <i class="pi pi-flag text-white text-2xl"></i>
                    </div>
                    <div>
                        <div class="flex items-center justify-center gap-3">
                            <h1 class="text-4xl font-bold text-white tracking-tight font-sans">
                                {{data?.generalStats.players[0].title}}
                            </h1>
                            <span :class="[data?.generalStats.players[0].type === 'GvG' 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
                                    'px-3 py-1 rounded-full text-sm font-semibold border-2 bg-orange-500/20 text-orange-300 border-orange-500/50']">
                                {{data?.generalStats.players[0].type}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <!-- Left Sidebar - Guild Cards -->
                <div class="lg:col-span-4 xl:col-span-1">
                    <div class="top-4">
                        <div class="mb-4 flex items-center justify-between">
                            <h2 class="text-xl font-semibold text-white">Guilds</h2>
                            <span class="text-sm text-zinc-400">{{ data?.guildStats.length }} total</span>
                        </div>
                        
                        <div class="space-y-3 max-h-screen overflow-y-auto pr-2 custom-scrollbar">
                            <!-- Guild Cards -->
                            <div 
                                v-for="(guild, index) in data?.guildStats" 
                                :key="index"
                                @click="onGuildClick(guild)"
                                :class="[
                                    'group relative overflow-hidden rounded-xl p-4 cursor-pointer transition-all duration-300',
                                    'bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-sm',
                                    'border-2 hover:shadow-lg hover:shadow-purple-900/20',
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
                <div class="lg:col-span-8 xl:col-span-4">
                    <!-- Stats Header -->
                    <div class="flex justify-end items-center gap-3 rounded-lg">
                        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <i class="pi pi-address-book text-white text-lg"></i>
                        </div>
                        <div>
                            <div class="text-2xl font-bold text-white">{{ combatLogData?.total_guilds }}</div>
                            <div class="text-xs text-zinc-400 uppercase tracking-wide">Guilds</div>
                        </div>
                        <div class="flex items-center gap-3 rounded-lg p-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <i class="pi pi-users text-white text-lg"></i>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-white">{{ combatLogData?.total_players }}</div>
                                <div class="text-xs text-zinc-400 uppercase tracking-wide">Players</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 rounded-lg p-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                                <i class="pi pi-clock text-white text-lg"></i>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-white">{{ combatLogData?.duration }}</div>
                                <div class="text-xs text-zinc-400 uppercase tracking-wide">Minutes</div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between">
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
                                    <InputText class="w-[250px]" v-model="searchName" placeholder="Search players..." />
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

                    <!-- Data Table -->
                    <div class="bg-zinc-800/50 text-sm backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl overflow-hidden max-h-screen min-w-full">
                        <DataTable 
                            :key="tableKey" 
                            :value="filteredTableData" 
                            :paginator="filteredTableData.length > 15"
                            :rows="15"
                            class="combat-stats-table"
                            :rowHover="true"
                            sortField="kills"
                            :sortOrder="-1"
                            :totalRecords="filteredTableData.length"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                        >
                            <Column field="guild" header="Guild" sortable style="width: 10%"></Column>
                            <Column field="class" header="Class" sortable style="width: 10%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <ClassIcon :class="slotProps.data.class.replace(/\s/g, '_')"></ClassIcon>
                                        <span class="text-zinc-300">{{ slotProps.data.class }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="family_name" header="Player" sortable style="width: 10%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span class="text-white font-medium">{{ slotProps.data.family_name }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="kills" header="Kills" sortable style="width: 10%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span class="text-cyan-400 font-semibold">{{ slotProps.data.kills }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="deaths" header="Deaths" sortable style="width: 10%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span class="text-red-400 font-semibold">{{ slotProps.data.deaths }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="kd" header="K/D" sortable style="width: 10%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span v-if="slotProps.data.kd>=1" class="text-green-400 font-semibold">{{ slotProps.data.kd }}</span>
                                        <span v-else-if="slotProps.data.kd<1 && slotProps.data.kd >=0.7" class="text-orange-400 font-semibold">{{ slotProps.data.kd }}</span>
                                        <span v-else-if="slotProps.data.kd<0.7" class="text-red-400 font-semibold">{{ slotProps.data.kd }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="performance" header="Performance" sortable style="width: 10%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold">{{ slotProps.data.performance }}</span>
                                    </div>
                                </template>
                            </Column>
                            <Column field="join_duration" header="Join duration" sortable style="width: 12%">
                                <template #body="slotProps">
                                    <div class="flex items-center gap-2">
                                        <span class="text-gray-400">{{ slotProps.data.join_duration }} min</span>
                                    </div>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-3 gap-6 mt-4">
                <div class="grid-span-1 bg-secondary p-2 rounded-xl">
                    <h1 class="font-bold text-xl">Guild Member Distribution</h1>
                    <Chart type="doughnut" :data="chartDataGuildDistribution" :options="doghnutChartOptions" :plugins="[centerTextPlugin]" class="w-full h-[24rem]" />
                </div>
                <div class="grid-span-1 bg-secondary p-2 rounded-xl">
                    <h1 class="font-bold text-xl">{{selectedGuild}} Top 10 Performers</h1>
                    <Chart type="bar" :data="chartDataTopPerformers" :options="BarchartOptions" class="h-[24rem]" />
                </div>
                <div class="grid-span-1 bg-secondary p-2 rounded-xl">
                    <h1 class="font-bold text-xl">{{selectedGuild}} Bottom 10 Performers</h1>
                    <Chart type="bar" :data="chartDataBottomPerformers" :options="BarchartOptions" class="h-[24rem]" />
                </div>
            </div>

            <!-- Kill/Death Matrix Section -->
            <div class="grid grid-cols-2 mt-4 gap-6 h-[850px]">
                <!-- Column 1: Players Selection -->
                <div class="col-span-1 flex flex-col bg-secondary rounded-xl overflow-hidden">
                    <!-- Header -->
                    <div class="p-4 border-b border-zinc-700/50 shrink-0">
                        <h1 class="text-2xl font-bold flex items-center gap-2">
                            <i class="pi pi-users text-purple-400"></i>
                            Players
                        </h1>
                        <p class="text-sm text-zinc-400 mt-1">Select a player to view combat details</p>
                    </div>

                    <!-- Guild Selector -->
                    <div class="p-4 border-b border-zinc-700/50 bg-zinc-800/30 shrink-0">
                        <div class="flex items-center justify-between mb-2">
                            <label class="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                                <i class="pi pi-shield text-orange-400"></i>
                                Enemy Guild Filter
                            </label>
                            <button 
                                v-if="selectedEnemyGuild"
                                @click="selectedEnemyGuild = null"
                                class="px-3 py-2 rounded-lg text-xs font-semibold p-2 bg-cyan-600 hover:bg-cyan-500 transition-colors"
                            >
                                Clear Filter
                            </button>
                        </div>
                        <div class="flex gap-2 flex-wrap">
                            <button
                                v-for="guild in enemyGuildOptions"
                                :key="guild"
                                @click="onEnemyGuildSelect(guild)"
                                :class="[
                                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                    selectedEnemyGuild === guild
                                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                                        : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 border border-zinc-600/50'
                                ]"
                            >
                                {{ guild }}
                            </button>
                        </div>
                    </div>

                    <!-- Sort Filters -->
                    <div class="px-4 py-3 border-b border-zinc-700/50 bg-zinc-800/20 shrink-0">
                        <label class="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-2">
                            <i class="pi pi-sort-alt text-purple-400"></i>
                            Sort By
                        </label>
                        <div class="flex gap-2 flex-wrap">
                            <button
                                @click="toggleKillsSort"
                                :class="[
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                                    matrixKillsFilter
                                        ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50'
                                        : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 border border-zinc-600/50'
                                ]"
                            >
                                Kills
                                <i v-if="matrixKillsFilter === 'desc'" class="pi pi-arrow-down text-xs"></i>
                                <i v-else-if="matrixKillsFilter === 'asc'" class="pi pi-arrow-up text-xs"></i>
                            </button>
                            <button
                                @click="toggleDeathsSort"
                                :class="[
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                                    matrixDeathsFilter
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                                        : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 border border-zinc-600/50'
                                ]"
                            >
                                Deaths
                                <i v-if="matrixDeathsFilter === 'desc'" class="pi pi-arrow-down text-xs"></i>
                                <i v-else-if="matrixDeathsFilter === 'asc'" class="pi pi-arrow-up text-xs"></i>
                            </button>
                            <button
                                @click="toggleKDSort"
                                :class="[
                                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5',
                                    matrixKDFilter
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                        : 'bg-zinc-700/50 text-zinc-300 hover:bg-zinc-700 border border-zinc-600/50'
                                ]"
                            >
                                K/D
                                <i v-if="matrixKDFilter === 'desc'" class="pi pi-arrow-down text-xs"></i>
                                <i v-else-if="matrixKDFilter === 'asc'" class="pi pi-arrow-up text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Allies and Enemies Grid — fills remaining height, each column scrolls independently -->
                    <div class="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0">

                        <!-- Allies Column -->
                        <div class="flex flex-col bg-gradient-to-r from-cyan-900/30 to-cyan-800/20 border border-cyan-700/30 rounded-xl overflow-hidden min-h-0">
                            <div class="p-3 bg-cyan-900/30 border-b border-cyan-700/30 shrink-0">
                                <h2 class="text-lg font-bold flex items-center gap-2">
                                    <i class="pi pi-shield text-cyan-400"></i>
                                    <span class="text-cyan-300">Allies</span>
                                    <span class="text-sm ml-auto">{{ alliesData.length }}</span>
                                </h2>
                                <p class="text-sm font-semibold text-cyan-400/70 mt-1">{{ mainGuild }}</p>
                            </div>
                            <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 min-h-0">
                                <div 
                                    v-if="alliesData.length === 0"
                                    class="text-center text-zinc-500 py-8 text-sm"
                                >
                                    No allies found
                                </div>
                                <div 
                                    v-for="ally in sortPlayers(alliesData)" 
                                    :key="ally"
                                    @click="onPlayerSelect(ally)"
                                    :class="[
                                        'p-3 rounded-lg cursor-pointer transition-all duration-200 shadow-md',
                                        selectedPlayerName === ally 
                                            ? 'border-2 border-cyan-400 shadow-xl shadow-cyan-900/30' 
                                            : 'border-2 border-cyan-800/20 hover:border-cyan-600/40 hover:shadow-lg hover:shadow-cyan-900/20'
                                    ]"
                                >
                                    <div class="font-bold text-base mb-2 text-white">{{ ally }}</div>
                                    <div class="flex gap-3 text-sm">
                                        <span class="text-cyan-400 font-semibold">K: {{ getPlayerStats(ally).kills }}</span>
                                        <span class="text-red-400 font-semibold">D: {{ getPlayerStats(ally).deaths }}</span>
                                        <span :class="[getKDColor(getPlayerStats(ally).kd), 'font-semibold']">
                                            KD: {{ getPlayerStats(ally).kd }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Enemies Column -->
                        <div class="flex flex-col bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-xl border border-orange-700/30 overflow-hidden min-h-0">
                            <div class="p-3 bg-orange-900/30 border-b border-orange-700/30 shrink-0">
                                <h2 class="text-lg font-bold flex items-center gap-2">
                                    <i class="pi pi-bolt text-orange-400"></i>
                                    <span class="text-orange-300">Enemies</span>
                                    <span class="text-sm ml-auto">{{ enemiesData.length }}</span>
                                </h2>
                                <p class="text-sm font-semibold text-orange-400/70 mt-1">
                                    {{ selectedEnemyGuild || 'All Guilds' }}
                                </p>
                            </div>
                            <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 min-h-0">
                                <div 
                                    v-if="enemiesData.length === 0"
                                    class="text-center text-zinc-500 py-8 text-sm"
                                >
                                    No enemies found
                                </div>
                                <div 
                                    v-for="enemy in sortPlayers(enemiesData)" 
                                    :key="enemy"
                                    @click="onPlayerSelect(enemy)"
                                    :class="[
                                        'p-3 rounded-lg cursor-pointer transition-all duration-200 shadow-md',
                                        selectedPlayerName === enemy 
                                            ? 'border-2 border-orange-400 shadow-xl shadow-orange-900/30' 
                                            : 'border-2 border-orange-800/20 hover:border-orange-600/40 hover:shadow-lg hover:shadow-orange-900/20'
                                    ]"
                                >
                                    <div class="font-bold text-base mb-1 text-white">{{ enemy }}</div>
                                    <div class="text-xs text-zinc-400 mb-2">{{ getPlayerGuild(enemy) }}</div>
                                    <div class="flex gap-3 text-sm">
                                        <span class="text-cyan-400 font-semibold">K: {{ getPlayerStats(enemy).kills }}</span>
                                        <span class="text-red-400 font-semibold">D: {{ getPlayerStats(enemy).deaths }}</span>
                                        <span :class="[getKDColor(getPlayerStats(enemy).kd), 'font-semibold']">
                                            KD: {{ getPlayerStats(enemy).kd }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Column 2: Kills & Deaths -->
                <div class="col-span-1 grid grid-cols-2 gap-4 min-h-0">

                    <!-- Kills Column -->
                    <div class="col-span-1 flex flex-col bg-secondary rounded-xl overflow-hidden min-h-0">
                        <div class="p-4 bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl border border-green-700/30 shrink-0">
                            <h1 class="text-xl font-bold flex items-center gap-2">
                                <i class="pi pi-bolt text-green-400"></i>
                                <span class="text-green-300">Kills</span>
                            </h1>
                            <p class="text-xs text-green-400/70 mt-1">
                                {{ selectedPlayerName || 'Select a player' }}
                            </p>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1 min-h-0">
                            <div 
                                v-if="!killedPlayers"
                                class="flex flex-col items-center justify-center h-full text-zinc-500"
                            >
                                <i class="pi pi-crosshairs text-4xl mb-3 text-zinc-600"></i>
                                <p class="text-sm">Select a player to view kills</p>
                            </div>
                            <div class="space-y-1" v-else>
                                <div 
                                    class="flex justify-between items-center bg-gradient-to-r from-green-900/20 to-transparent p-3 rounded-lg hover:from-green-900/30 transition-all border border-green-700/20 hover:border-green-600/40"
                                    v-for="(innerObj, familyName) in sortedKilledPlayers" 
                                    :key="familyName"
                                >
                                    <div class="flex flex-col">
                                        <span class="font-medium text-white">{{ innerObj.name }}</span>
                                        <span class="text-xs text-green-400/70">{{ getPlayerGuild(innerObj.name) }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="bg-green-600/30 text-green-300 px-3 py-1 rounded-full text-sm font-bold border border-green-500/30">
                                            {{ innerObj.count }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Deaths Column -->
                    <div class="col-span-1 flex flex-col bg-secondary rounded-xl overflow-hidden min-h-0">
                        <div class="p-4 bg-gradient-to-br from-red-900/20 to-red-800/10 rounded-xl border border-red-700/30 shrink-0">
                            <h1 class="text-xl font-bold flex items-center gap-2">
                                <i class="pi pi-bolt text-red-400"></i>
                                <span class="text-red-300">Died To</span>
                            </h1>
                            <p class="text-xs text-red-400/70 mt-1">
                                {{ selectedPlayerName || 'Select a player' }}
                            </p>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1 min-h-0">
                            <div 
                                v-if="!diedTo"
                                class="flex flex-col items-center justify-center h-full text-zinc-500"
                            >
                                <i class="pi pi-crosshairs text-4xl mb-3 text-zinc-600"></i>
                                <p class="text-sm">Select a player to view deaths</p>
                            </div>
                            <div class="space-y-1" v-else>
                                <div 
                                    class="flex justify-between items-center bg-gradient-to-r from-red-900/20 to-transparent p-3 rounded-lg hover:from-red-900/30 transition-all border border-red-700/20 hover:border-red-600/40"
                                    v-for="(innerObj, familyName) in sortedDiedTo" 
                                    :key="familyName"
                                >
                                    <div class="flex flex-col">
                                        <span class="font-medium text-white">{{ innerObj.name }}</span>
                                        <span class="text-xs text-red-400/70">{{ getPlayerGuild(innerObj.name) }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="bg-red-600/30 text-red-300 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">
                                            {{ innerObj.count }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
}

:deep(.p-datatable-column-header-content) {
   padding: 0.6rem;
   border-radius: 8px;
}

:deep(.p-datatable-column-header-content:hover) {
    background: rgb(39, 39, 42);
}

:deep(.p-datatable-column-sorted > div.p-datatable-column-header-content) {
    background: rgb(39, 39, 42);
}

:deep(.p-datatable-header-cell) {
   padding: 0.4rem;
}

:deep(.p-datatable-header-cell:hover) {
    background: rgb(17, 17, 19);
}

:deep(.p-datatable-thead > tr > th) {
    background: rgb(17, 17, 19);
    color: rgb(255, 255, 255);
    border: none;
    font-weight: 600;
    font-size: 0.85rem;
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
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
<script setup lang="ts">
import { UButton } from '#components';
import type { AllStats, CalculatedMetrics } from '@/models/models';
import { formatNumberWithCommas } from '@/server/utils/formatNumberWithCommas';
import type { Database } from '@/types/supabase';
import type { TableColumn } from '@nuxt/ui';

const sorting = ref([
    {
        id: 'average_dealt',
        desc: true
    }
])
const nuxtApp = useNuxtApp();

const defaultMetrics: CalculatedMetrics = {
    averageDealt: { dealt: 0, name: '-' }, averageTaken: { taken: 0, name: '-' },
    averageDebuffs: { debuffs: 0, name: '-' }, averageHealed: { healed: 0, name: '-' },
    averageKills: { kills: 0, name: '-' }, averageDeaths: { deaths: 0, name: '-' },
    averageKDR: { kdr: 0, name: '-' }, mostKills: { kills: 0, name: '-' },
    mostDamage: { damage: 0, name: '-' }, mostDeaths: { deaths: 0, name: '-' },
};
const guildName = ref('Insecure');
const enemyGuild = ref('');
const gameData = ref<AllStats | null>(null);
const displayData = ref<AllStats>();
const opponentsRef = ref<string[]>(['All']);
const test = ref(['a', 'b', 'c'])
const select = ref<string>()
const activeTab = ref('0');
const renderKey = ref(0);
const renderKeyU = ref(0);

const { data: opponents, error: opponentsError } = await useAsyncData('opponents', async () => {
    return await $fetch<{ enemy_guild: string }[]>('/api/get-opponents');
},
    {
        getCachedData(key) {
            return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
        }
    }
)
if (opponentsError.value) {
    console.log(opponentsError.value)
}
if (opponents.value) {
    const newArray = opponents.value.map((item) => item.enemy_guild)
    const uniqueOpponents = new Set(newArray);
    uniqueOpponents.forEach(element => {
        if (element == 'Insecure') uniqueOpponents.delete(element)
    });
    console.log(uniqueOpponents);
    uniqueOpponents.forEach(element => {
        opponentsRef.value.push(element);
    });
    select.value = opponentsRef.value[0]
}

watch(select, async (value, oldVal) => {
    if (value != oldVal && select.value) {
        enemyGuild.value = select.value;
        activeTab.value = '0'
        await getGuildStats();
        console.log("Xd: ", gameData.value)
    }
})

watch(activeTab, (newValue, oldValue) => {
    console.log(`Watcher triggered: activeTab changed from ${oldValue} to ${newValue}`);

    if (newValue !== oldValue) {
        if (!gameData.value) {
            console.warn("Watcher: gameData is not loaded. Setting displayData to default.");
            displayData.value = { guildMetrics: { ...defaultMetrics } } as AllStats; // Ensure displayData has the structure
            return;
        }

        if (newValue === '0') {
            console.log("Watcher: Setting displayData to Guild Metrics");
            displayData.value = {
                ...displayData.value!, // Keep other properties of displayData
                guildMetrics: gameData.value.guildMetrics ? { ...gameData.value.guildMetrics } : { ...defaultMetrics }
            };
        } else {
            console.log("Watcher: Setting displayData to Enemy Metrics");
            displayData.value = {
                ...displayData.value!, // Keep other properties of displayData
                guildMetrics: gameData.value.enemyMetrics ? { ...gameData.value.enemyMetrics } : { ...defaultMetrics }
            };
        }
        console.log("Watcher: Updated displayData:", displayData.value);
        console.log("gamedata after tab change: ", gameData.value); // Add this for debugging
    }
}, { immediate: false });


const getGuildStats = async () => {
    const { data, error } = await useAsyncData(`guildStats${enemyGuild.value}`, async () => {
        return await $fetch<AllStats>('/api/get-guild-stats', { method: 'POST', body: { guildName: guildName.value, enemyGuild: enemyGuild.value } })
    },
        {
            getCachedData(key) {
                return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
            }
        }
    )

    if (error.value) {
        console.log(error.value);
        return error.value;
    }
    if (data.value) {
        gameData.value = data.value;
        displayData.value = data.value;
        console.log("gamedata: ", gameData.value)
    }

}

onMounted(async () => {
    await getGuildStats();
    if (!gameData.value) await getGuildStats();
    console.log("gamedata: ", gameData.value)
})

const visibleColumns: TableColumn<Database['public']['Tables']['aggregated_stats_total']['Row']>[] = [
    {
        accessorKey: 'player_name',
        header: 'Name',
        cell: ({ row, column }) => {
            const isPinned = column.getIsPinned();

            return h('div', {
                class: `${isPinned ? 'font-medium' : ''}`,
            },
                row.getValue('player_name')
            );
        },
    },

    {
        accessorKey: 'average_dealt',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average Dealt',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('average_dealt'))}`
    },

    {
        accessorKey: 'average_kd',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average Kills',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${parseFloat(row.getValue('average_kd')).toFixed(2).replace('.', ',')}`
    },

    {
        accessorKey: 'average_deaths',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average Deaths',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${parseFloat(row.getValue('average_deaths')).toFixed(2).replace('.', ',')}`
    },

    {
        accessorKey: 'average_kdr',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average KD',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${parseFloat(row.getValue('average_kdr')).toFixed(2).replace('.', ',')}`
    },

    {
        accessorKey: 'highest_kd',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Highest Kills',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('highest_kd'))}`
    },

    {
        accessorKey: 'highest_dealt',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Highest Damage',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('highest_dealt'))}`
    },

    {
        accessorKey: 'average_debuffs',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average Debuffs',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${row.getValue('average_debuffs')}`
    },

    {
        accessorKey: 'average_healed',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average Healed',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('average_healed'))}`
    },

    {
        accessorKey: 'average_taken',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Average Taken',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('average_taken'))}`
    },

    {
        accessorKey: 'total_dealt',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Total Dealt',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('total_dealt'))}`
    },

    {
        accessorKey: 'total_taken',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Total Taken',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('total_taken'))}`
    },

    {
        accessorKey: 'total_kd',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Total Kills',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('total_kd'))}`
    },

    {
        accessorKey: 'total_deaths',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Total Deaths',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('total_deaths'))}`
    },

    {
        accessorKey: 'total_debuffs',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Total Debuffs',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('total_debuffs'))}`
    },

    {
        accessorKey: 'total_healed',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Total Healed',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('total_healed'))}`
    },


    {
        accessorKey: 'highest_taken',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Highest Taken',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('highest_taken'))}`
    },


    {
        accessorKey: 'highest_deaths',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Highest Deaths',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('highest_deaths'))}`
    },

    {
        accessorKey: 'highest_debuffs',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Highest Debuffs',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('highest_debuffs'))}`
    },

    {
        accessorKey: 'highest_healed',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Highest Healed',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('highest_healed'))}`
    },

    {
        accessorKey: 'games_count',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Games Played',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('games_count'))}`
    },

    {
        accessorKey: 'guild',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Guild',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${row.getValue('guild')}`
    },
];

const columnPinning = ref({
    left: ['player_name'],
    //   right: ['amount']
})

const tr = 'even:bg-card  odd:bg-muted text-center max-w-[600px]';
const tableHead = `bg-purple-500 dark:bg-purple-700 py-0  h-[50px] text-center  `
const td = 'text-foreground  text-base '

</script>

<template>
    <div v-if="gameData && displayData"
        class="h-full 2xl:w-7xl flex flex-col w-screen  place-self-center items-center ">
        <span class=" font-bold text-4xl">Guild Stats</span>
        <!-- Top Players Cards -->
        <div
            class="h-[400px]  2xl:h-[380px] overflow-auto w-full 2xl:grid space-y-4 2xl:gap-x-2 2xl:space-y-0 flex-row justify-items-center grid-rows-2 grid-cols-5 auto-rows-min    2xl:justify-between items-center   ">

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="iconamoon:lightning-2-bold" size="32" />
                    <span class="font-bold text-xl">Average Dealt</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageDealt.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.averageDealt.dealt) }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="mdi:boxing-glove" size="32" />
                    <span class="font-bold text-xl">Average Taken</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageTaken.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.averageTaken.taken) }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex  flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="qlementine-icons:bongos-16" size="32" />
                    <span class="font-bold text-xl">Average Debuffs</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageDebuffs.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.averageDebuffs.debuffs) }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500"
                        name="streamline:health-medical-heart-rate-health-beauty-information-data-beat-pulse-monitor-heart-rate-info"
                        size="32" />
                    <span class="font-bold text-xl">Average Healed</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageHealed.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.averageHealed.healed) }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="mdi:target" size="32" />
                    <span class="font-bold text-xl">Average KD</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageKDR.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    displayData.guildMetrics?.averageKDR.kdr.toFixed(2).replace('.', ',') }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="akar-icons:double-sword" size="32" />
                    <span class="font-bold text-xl">Average Kills</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageKills.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    displayData.guildMetrics?.averageKills.kills.toFixed(2).replace('.', ',') }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="material-symbols:skull" size="32" />
                    <span class="font-bold text-xl">Average Deaths</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.averageDeaths.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    displayData.guildMetrics?.averageDeaths.deaths.toFixed(2).replace('.', ',') }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="mingcute:surprise-line" size="32" />
                    <span class="font-bold text-xl">Most Kills</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.mostKills.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.mostKills.kills) }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="mdi:shield-check-outline" size="32" />
                    <span class="font-bold text-xl">Most Damage</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.mostDamage.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.mostDamage.damage) }}</span>
            </div>

            <div
                class="border-blue-500 col-span-1 border flex flex-col items-center 2xl:w-full w-[385px] h-[120px] 2xl:h-[150px] bg-card rounded-md shadow-lg">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="fa6-solid:skull-crossbones" size="32" />
                    <span class="font-bold text-xl">Most Deaths</span>
                </div>
                <span class="font-bold text-3xl  h-full flex items-center justify-center">
                    <span class="inline-block truncate max-w-[240px]">
                        {{ displayData.guildMetrics?.mostDeaths.name }}
                    </span>
                </span>
                <span class="font-bold text-3xl h-full flex items-center text-info-500">{{
                    formatNumberWithCommas(displayData.guildMetrics?.mostDeaths.deaths) }}</span>
            </div>
        </div>

        <div class="flex place-self-start justify-center items-center mt-2 gap-2">
            <USelect class="text-foreground w-48  m-0 h-10 scroll-auto" variant="outline" v-model="select"
                :items="opponentsRef" />
            <UTabs v-model="activeTab" color="info" :content="false" :items="[{ label: 'Insecure' }, { label: select }]"
                class="w-full " />
        </div>

        <!-- Table all guild players -->
        <div v-if="activeTab" class="mt-2 w-full h-[600px] overflow-auto ">
            <UTable v-if="activeTab == '0'" :key="renderKey" v-model:column-pinning="columnPinning"
                v-model:sorting="sorting" class="w-full h-full font-light overflow-auto" :data="gameData.guildStats"
                :columns="visibleColumns" :ui="{ th: tableHead, td: td, tr: tr }" />
            <UTable v-else v-model:sorting="sorting" :key="renderKeyU" v-model:column-pinning="columnPinning"
                class="w-full h-full font-light overflow-auto" :data="gameData.enemyGuildStats"
                :columns="visibleColumns" :ui="{ th: tableHead, td: td, tr: tr }" />
        </div>

        <!-- spinner loader -->
    </div>
    <div v-else class="h-full 2xl:w-7xl flex flex-col w-screen  place-self-center jutify-center items-center">
        <div class="w-full h-full flex flex-col items-center justify-center">
            <UIcon name="svg-spinners:bars-rotate-fade" size="72" />
        </div>
    </div>
</template>
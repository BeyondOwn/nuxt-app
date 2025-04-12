<script setup lang="ts">
import { UButton } from '#components';
import type { Database } from '@/types/supabase';
import type { TableColumn } from '@nuxt/ui';

const myGuild = ref('Insecure');

const user = await useSupabaseUser();
console.log("USER FROM FRONT: ", user);

interface tableDataInt {
    name: string | null,
    kd: string | null,
    debuffs: number | null,
    dealt: number | null,
    taken: number | null,
    healed: number | null
}

function formatNumberWithCommas(number: number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const toast = useToast();
const route = useRoute();
const gameId = route.params.slug;
console.log("Slug: ", route.params.slug)
// const queryParams = route.query;
const loading = ref(true);
const victoryTableData = ref<tableDataInt[]>([]);
const defeatTableData = ref<tableDataInt[]>([]);

const { data: queryParams } = await useAsyncData(
    'game',
    () => $fetch<Database['public']['Tables']['games']['Row']>('/api/get-game', { method: 'POST', body: gameId })
);

console.log("query: ", queryParams.value)

const { data: stats, status, error, refresh, clear } = await useAsyncData(
    `stats ${gameId}`,
    () => $fetch<Database['public']['Tables']['game_players']['Row'][]>('/api/get-player-stats', { method: 'POST', body: { gameId: gameId } })
);
if (stats.value) {
    stats.value?.map((stat) => {
        if (stat.team_type == 'victory') {
            victoryTableData?.value.push(
                {
                    name: stat.player_name,
                    kd: stat.kd,
                    debuffs: stat.debuffs,
                    dealt: stat.dealt,
                    taken: stat.taken,
                    healed: stat.healed,
                }
            )
        }
        else {
            defeatTableData?.value.push(
                {
                    name: stat.player_name,
                    kd: stat.kd,
                    debuffs: stat.debuffs,
                    dealt: stat.dealt,
                    taken: stat.taken,
                    healed: stat.healed,
                }
            )
        }

    })
}


if (error) console.log(error.value)

loading.value = false;

const columns: TableColumn<tableDataInt, unknown>[] = [
    {
        id: 'name',
        accessorKey: 'name',
        header: () => h('div', { class: 'text-base' }, 'Name'),
        cell: ({ row }) => `${row.getValue('name')}`,
        meta: {
            class: {
                td: 'text-left   '
            }
        }

    },
    {
        id: 'kd',
        accessorKey: 'kd',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'K/D',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${row.getValue('kd')}`,
        sortingFn: (rowA, rowB, columnId) => {
            // Add type assertions to handle the unknown type
            const aString = rowA.getValue(columnId) as string;
            const bString = rowB.getValue(columnId) as string;
            // Extract the number before the slash
            const aValue = parseInt(aString.split('/')[0], 10);
            const bValue = parseInt(bString.split('/')[0], 10);

            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
    },
    {
        accessorKey: 'debuffs',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Debuffs',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => {
            return h('div', row.getValue('debuffs'))
        }
    },
    {
        id: 'dealt',
        accessorKey: 'dealt',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Dealt',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => h('div', formatNumberWithCommas(row.getValue('dealt'))),
    },
    {
        accessorKey: 'taken',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Taken',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('taken'))}`
    },
    {
        accessorKey: 'healed',
        header: ({ column }) => {
            const isSorted = column.getIsSorted();

            return h(UButton, {
                variant: 'ghost',
                label: 'Healed',
                icon: isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down',
                class: '-mx-2.5 cursor-pointer font-bold text-base text-foreground h-full hover:bg-purple-600',
                onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            });
        },
        cell: ({ row }) => `${formatNumberWithCommas(row.getValue('healed'))}`
    },
];

const tableUI = 'even:bg-card  odd:bg-muted text-center max-w-[600px]';
const tableHead = 'bg-purple-700 py-0  h-[50px] text-center first:text-left'
const td = 'text-foreground  text-base'

const sortingVictory = ref([
    {
        id: 'dealt',
        desc: true
    }
])

const sortingDefeat = ref([
    {
        id: 'dealt',
        desc: true
    }
])



</script>

<template>
    <div class="grid grid-cols-12  w-full place-items-center text-foreground overflow-auto px-4">
        <div v-if="queryParams" class="text-2xl col-span-12 font-semibold w-[90%] 2xl:w-7xl flex flex-row  gap-4">
            <span class="text-error" v-if="myGuild == queryParams?.defeat_team_name">Defeat vs {{
                queryParams?.victory_team_name
            }}</span>
            <span class="text-primary-nuxt" v-else>Victory vs {{ queryParams?.defeat_team_name }}</span>
            <span>Score: {{ queryParams?.victory_team_score }} - {{ queryParams?.defeat_team_score }}</span>
            <span class=" ml-auto">{{ queryParams?.date_hour }}</span>
        </div>
        <div v-if="!loading" class="col-span-12  flex flex-col 2xl:flex-row mt-2  gap-4 w-[90%]  2xl:w-7xl  ">
            <div class="flex flex-col items-center    ">
                <div class="w-full flex flex-col items-center bg-purple-700">
                    <span class="font-bold text-primary-nuxt">[Victory] {{ queryParams?.victory_team_name }}</span>
                </div>
                <UTable v-model:sorting="sortingVictory" :ui="{ td: td, tr: tableUI, th: tableHead }"
                    class=" w-full 2xl:w-[635px] font-light overflow-auto" :data="victoryTableData"
                    :columns="columns" />
            </div>

            <div class=" flex flex-col items-center ">
                <div class="w-full flex flex-col items-center bg-purple-700">
                    <span class="font-bold text-red-600">[Defeat] {{ queryParams?.defeat_team_name }}</span>
                </div>
                <UTable v-model:sorting="sortingDefeat" :ui="{ td: td, tr: tableUI, th: tableHead }"
                    class="w-full 2xl:w-[635px] font-light overflow-auto" :data="defeatTableData" :columns="columns" />
            </div>
        </div>
    </div>
</template>

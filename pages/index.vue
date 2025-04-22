<script setup lang="ts">
import type { Database } from '@/types/supabase';

const route = useRoute();
const myGuild = ref('Insecure');
const totalGames = ref();
const victories = ref();
const defeats = ref();
const winrate = ref();
const currentPage = useState('currentPage', () => 1); // Start with page 1
const itemsPerPage = ref(6); // Items per page
const totalCount = ref(0);
const loading = ref(false);
const fetchError = ref();
const games = ref<Database['public']['Tables']['games']['Row'][]>([]);
const nuxtApp = useNuxtApp();
const filter = useState('filter', () => 'all');
const searchQuery = useState('search', () => '');
const paginationKey = ref(1);



// interface getGamesInfinite {
//     data: Database['public']['Tables']['games']['Row'][],
//     totalCount: number,
//     currentPage: number,
//     pageSize: number,
//     hasNextPage: boolean,
//     error?: any;
// }


async function fetchGames() {
    console.log("ReqHeaders: ", useRequestHeaders(['cookie']))
    if (loading.value) return;
    loading.value = true;
    fetchError.value = null;
    console.log("Fetch games called with page: ")

    try {
        const { data, error, status } = await useAsyncData(
            `allGames`,
            async () => await $fetch<{ data: Database['public']['Tables']['games']['Row'][], count: number }>('/api/get-games', {
                headers: useRequestHeaders(['cookie']),
            }),
            {
                getCachedData(key) {
                    return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
                }
            },
        )
        console.log("status:", status.value)
        if (error.value) {
            fetchError.value = error.value;
            console.error('Error fetching games:', error);
            return error.value;
        }
        console.log("Data from useAsync: ", data.value)
        if (data.value) {
            console.log("status:", status.value)
            console.log("Games: ", data.value)
            games.value = data.value?.data; // Replace existing data with the new page
            totalCount.value = data.value.count;
        };
    } catch (error: any) {
        fetchError.value = error;
        console.error('An unexpected error occurred:', error);
    } finally {
        loading.value = false;
    }
}



const client = await useSupabaseClient();


const getStats = async () => {
    totalGames.value = 0;
    victories.value = 0;
    defeats.value = 0;
    if (games.value) {
        totalGames.value = games.value?.length;
        try {
            const { data: stats, error: statsError } = await useAsyncData('totalStats', async () => {
                return await $fetch<{ totalGames: number, victories: number, defeats: number, winrate: number }>('/api/get-stats');
            },
                {
                    getCachedData(key) {
                        return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
                    }
                },
            )
            if (statsError.value) {
                console.log("We have statsError", statsError.value)
                return statsError.value;
            }

            if (stats.value) {
                totalGames.value = stats.value.totalGames;
                victories.value = stats.value.victories;
                defeats.value = stats.value.defeats;
                winrate.value = stats.value.winrate;
            }

        } catch (error) {
            console.log(error);
        }
    }
}


const filteredGames = computed(() => {
    return games.value.filter(game => {
        const opponentGuild = game.victory_team_name == 'Insecure' ? game.defeat_team_name : game.victory_team_name;
        const result = game.victory_team_name == 'Insecure' ? 'victory' : 'defeat'
        const resultFilter =
            filter.value === 'all' ||
            (filter.value === 'victories' && result === 'victory') || // Adjust 'victory' based on your API response
            (filter.value === 'defeats' && result === 'defeat');   // Adjust 'defeat' based on your API response

        const searchFilter =
            !searchQuery.value ||
            opponentGuild!.toLowerCase().includes(searchQuery.value.toLowerCase()); // Adjust 'opponentGuild' based on your API response

        return resultFilter && searchFilter;
    });
});

const totalPages = computed(() => {
    return Math.ceil(filteredGames.value.length / itemsPerPage.value);
});

const paginatedGames = computed(() => {
    const startIndex = (currentPage.value - 1) * itemsPerPage.value;
    const endIndex = startIndex + itemsPerPage.value;
    return filteredGames.value.slice(startIndex, endIndex);
});

// Watch for changes in totalPages
watch(() => totalPages.value, () => {
    paginationKey.value++
})



onMounted(async () => {
    await fetchGames();
    if (games.value.length == 0 || !games.value) fetchGames();
    await getStats();
    // games.value = sortByDate(games.value, 'date_hour', 'desc');
})


// const displayedGames = computed(() => {
//     if (!games.value) {
//         return [];
//     }
//     const startIndex = (currentPage.value - 1) * pageSize.value;
//     const endIndex = startIndex + pageSize.value;
//     return games.value.slice(startIndex, endIndex);
// });

async function handlePageChange(newPage: number) {
    currentPage.value = newPage;
}

client.channel(`public:games`).on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, async (payload) => {
    console.log("Payload: ", payload);
    await fetchGames();
    // games.value = sortByDate(games.value, 'date_hour', 'desc');
}).subscribe();



const pieChartOptions = {
    chart: {
        type: 'pie',
    },
    labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
    series: [44, 55, 13, 43], // Data values for each slice
    colors: ['#EE6D7A', '#4CAF50', '#2196F3', '#FFC107'],
    legend: {
        position: 'right',
        labels: {
            colors: 'text-foreground'
        }
    },
    responsive: [
        {
            breakpoint: 480,
            options: {
                chart: {
                    width: 200,
                },
                legend: {
                    position: 'bottom',
                },
            },
        },
    ],
};

</script>
<template>
    <div class=" w-full h-full flex flex-col items-center">
        <!-- stats container -->
        <span class="text-4xl font-bold">Total Stats</span>
        <div
            class="2xl:h-[150px] w-full flex flex-col items-center 2xl:items-baseline 2xl:flex-row  2xl:w-7xl  gap-4  mt-4  ">

            <div
                class="border-blue-500 border flex flex-col items-center w-[385px] 2xl:w-[300px]  h-[120px] 2xl:h-[150px] bg-card  rounded-md shadow-lg hover:shadow-xl hover:-translate-y-2 transition-transform duration-250 ease-in-out">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="material-symbols:grouped-bar-chart" size="32" />
                    <span class="font-bold text-xl ">Games</span>
                </div>

                <span class="font-bold text-4xl h-full flex items-center text-info-500">{{ totalGames }}</span>
            </div>
            <div
                class="border-blue-500 border flex flex-col items-center w-[385px] 2xl:w-[300px]  h-[120px] 2xl:h-[150px] bg-card  rounded-md shadow-lg hover:shadow-xl hover:-translate-y-2 transition-transform duration-250 ease-in-out">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="material-symbols:trophy" size="32" />
                    <span class="font-bold text-xl ">Victories</span>
                </div>

                <span class="font-bold text-4xl h-full flex items-center text-primary-nuxt">{{ victories }}</span>
            </div>
            <div
                class="border-blue-500 border flex flex-col items-center w-[385px] 2xl:w-[300px]  h-[120px] 2xl:h-[150px] bg-card  rounded-md shadow-lg hover:shadow-xl hover:-translate-y-2 transition-transform duration-250 ease-in-out">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="material-symbols:skull" size="32" />
                    <span class="font-bold text-xl">Defeats</span>
                </div>

                <span class="font-bold text-4xl h-full flex items-center text-red-500">{{ defeats }}</span>
            </div>
            <div
                class="border-blue-500 border flex flex-col items-center w-[385px] 2xl:w-[300px] h-[120px] 2xl:h-[150px] bg-card  rounded-md shadow-lg hover:shadow-xl hover:-translate-y-2 transition-transform duration-250 ease-in-out">
                <div class="flex flex-row items-center gap-2 mt-4">
                    <UIcon class="text-info-500" name="material-symbols:percent" size="32" />
                    <span class="font-bold text-xl ">Win Rate</span>
                </div>

                <span class="font-bold text-4xl h-full flex items-center text-info-500">{{ winrate }} %</span>
            </div>
        </div>
        <span class="text-4xl font-bold mt-4">Game Results</span>
        <!-- filters -->
        <div class="flex flex-col 2xl:flex-row justify-center w-max mt-4 gap-6">
            <UBadge size="xl" @click="filter = 'all'"
                :class="[`${filter == 'all' ? 'bg-info-500 text-foreground' : 'bg-background border border-info-500 text-foreground '}`, 'hover:cursor-pointer hover:bg-info-400 hover:text-foreground rounded-xl transition-colors duration-300 ease-out']"
                label="All Games" />
            <UBadge size="xl" @click="filter = 'victories'"
                :class="[`${filter == 'victories' ? 'bg-info-500 text-foreground' : 'bg-background border border-info-500  text-foreground'}`, 'hover:cursor-pointer hover:bg-info-400 hover:text-foreground rounded-xl transition-colors duration-300 ease-out']"
                label="Victories" />
            <UBadge size="xl" @click="filter = 'defeats'"
                :class="[`${filter == 'defeats' ? 'bg-info-500 text-foreground' : 'bg-background border border-info-500 text-foreground'}`, 'hover:cursor-pointer hover:bg-info-400 hover:text-foreground rounded-xl transition-colors duration-300 ease-out']"
                label="Defeats" />
            <UInput icon="i-lucide-search" placeholder="Search by guild" color="info" type="search"
                class="bg-background" size="md" variant="outline" v-model="searchQuery" />
        </div>
        <div v-if="games"
            class="2xl:w-7xl grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] auto-rows-min gap-4 mt-4">
            <div v-for="game in paginatedGames" :key="game.id" :onclick="() => navigateTo({
                path: `/${game.id}`
            })"
                :class="[`${myGuild == game.victory_team_name ? 'border-l-green-500' : 'border-l-red-500'}`, 'hover:shadow-xl hover:-translate-y-2 transition-transform duration-250 ease-in-out  col-span-1 bg-card w-[385px] h-[200px] border-l-4 rounded-l-md shadow-lg  hover:cursor-pointer ']">
                <div class="h-full w-full flex flex-col justify-between p-4">
                    <div class="flex flex-row justify-between items-center text-sm">
                        <date class="text-muted-foreground">
                            {{ game.date_hour }}
                        </date>
                        <UBadge class="font-semibold" v-if="game.victory_team_name == myGuild" size="lg" color="success"
                            variant="solid" label="VICTORY">
                        </UBadge>
                        <UBadge class="font-semibold bg-red-500" v-else variant="solid" size="lg" label="DEFEAT">
                        </UBadge>
                    </div>
                    <div class="flex flex-col ">
                        <span class="font-bold text-xl" v-if="game.victory_team_name != myGuild">{{
                            game.victory_team_name
                            }}</span>
                        <span class="font-bold text-xl" v-else-if="game.defeat_team_name != myGuild">{{
                            game.defeat_team_name
                            }}</span>
                        <span>{{ game.victory_team_score }} - {{ game.defeat_team_score }}</span>
                    </div>
                    <div class="flex flex-row items-center">
                        <span class="font-medium text-info ">View Match Details </span>
                        <UIcon class="text-info" size="20" name="material-symbols:arrow-right-alt"></UIcon>
                    </div>
                </div>
            </div>
            <!-- <apexchart class="bg-background text-foreground" type="pie" :options="pieChartOptions"
                :series="pieChartOptions.series">
            </apexchart> -->

        </div>


        <MyPagination color="bg-info-500" hover-color="bg-info-400" class="mt-auto mb-8" :page="currentPage"
            :total-pages="totalPages" :max-visible-pages="4" @update:page="handlePageChange" />


    </div>
</template>
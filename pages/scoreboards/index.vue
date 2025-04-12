<script setup lang="ts">
import type { Database } from '@/types/supabase';

const route = useRoute();
const myGuild = ref('Insecure');

const { data: games, status, error, refresh, clear } = await useAsyncData(
    'games',
    () => $fetch<Database['public']['Tables']['games']['Row'][]>('/api/get-games')
);
</script>
<template>
    <div class=" w-full h-full flex justify-center">
        <div class="w-7xl grid grid-cols-[repeat(auto-fill,minmax(350px,1fr))] auto-rows-min gap-4 mt-4">
            <div v-for="game in games" :key="game.id" :onclick="() => navigateTo({
                path: `${route.path}/${game.id}`
            })"
                :class="[`${myGuild == game.victory_team_name ? 'border-l-green-500' : 'border-l-red-500'}`, 'col-span-1 bg-card w-[380px] h-[200px] border-l-4 rounded-l-md shadow-xl  hover:cursor-pointer ']">
                <div class="h-full w-full flex flex-col justify-between p-4">
                    <div class="flex flex-row justify-between items-center text-sm">
                        <date class="text-muted-foreground">
                            {{ game.date_hour }}
                        </date>
                        <UBadge class="font-semibold" v-if="game.victory_team_name == myGuild" size="lg" color="success"
                            variant="solid" label="VICTORY">
                        </UBadge>
                        <UBadge class="font-semibold" v-else color="error" variant="solid" size="lg" label="DEFEAT">
                        </UBadge>
                    </div>
                    <span class="font-bold text-xl" v-if="game.victory_team_name != myGuild">{{ game.victory_team_name
                    }}</span>
                    <span class="font-bold text-xl" v-else-if="game.defeat_team_name != myGuild">{{
                        game.defeat_team_name
                    }}</span>

                    <div class="flex flex-row items-center">
                        <span class="font-medium text-primary-nuxt ">View Match Details </span>
                        <UIcon class="text-primary-nuxt" size="20" name="material-symbols:arrow-right-alt"></UIcon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
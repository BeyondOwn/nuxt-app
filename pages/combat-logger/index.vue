<script setup lang="ts">
import { toDateTime } from '@/server/utils/dateUtils';
import type { Database } from '@/types/supabase';
import Dialog from 'primevue/dialog';
import FloatLabel from 'primevue/floatlabel';
import SelectButton from 'primevue/selectbutton';
const nuxtApp = useNuxtApp();
const supabase = useSupabaseClient();
const allCombatLogs = ref<Database['public']['Tables']['combat_logs']['Row'][]>([]);
const guildName = ref();
const logName = ref();
const type = ref();
const fileUploadRef = ref();
const errorMessage = ref();
const visible = ref();
let combatLogSubscription = null;
let tableKey = 0;
const options = ['GvG','NodeWar']

const onBeforeSend = (event: any) => {
    // event.xhr is the XMLHttpRequest object
    // event.formData is the FormData being sent
    
    // Add your custom field to the existing FormData
    if (guildName.value) {
        event.formData.append('guild', guildName.value);
    }

    if (logName.value) {
        event.formData.append('logName', logName.value);
    }

    if (type.value) {
        event.formData.append('type', type.value);
    }
}

const afterUpload = (event:any) =>{
    if (event.xhr.status === 200) {
    navigateTo(`/combat-logger/${event.xhr.response}`)
  } else {
    // Handle error cases
    const errorData = JSON.parse(event.xhr.response)
    errorMessage.value = errorData.message;
    console.error('Upload failed with status:', errorData.message)
    // Optionally show an error message to the user
  }
}

const onError = (event:any) =>{
    const errorData = JSON.parse(event.xhr.response)
    errorMessage.value = errorData.message;
    console.log("PARSED: ",  errorData.message)
    
}
try {
        const { data, error, status } = await useAsyncData(
            `allCombatLogs`,
            async () => await $fetch<{ data: Database['public']['Tables']['combat_logs']['Row'][]}>('/api/get-combat-log', {
                headers: useRequestHeaders(['cookie']),method:"POST",
            }),
            {
                getCachedData(key) {
                    return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
                }
            },
        )
        console.log("AA: ",data.value?.data)
        // console.log("status:", status.value)
        if (error.value) {
            console.error('Error fetching games:', error);
        }
        if (data.value && data.value.length > 0)
        {
            allCombatLogs.value = data.value;
            console.log("ALLGAMES: ",allCombatLogs)
        }
    } catch(error:any){
        console.log(error);
    }

    onMounted(() => {
    console.log('Starting Supabase Realtime subscription...');
    
    combatLogSubscription = supabase
        .channel('combat_log_channel') // Give your channel a unique name
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'combat_logs' }, // Listen only for INSERTs
            (payload) => {
                console.log('Realtime INSERT event received:', payload);
                
                // Prepend the new row data to the reactive array
                if (payload.new) {

                    if (!Array.isArray(allCombatLogs.value)) {
                        allCombatLogs.value = [];
                    }
                    allCombatLogs.value.unshift(
                    payload.new as Database['public']['Tables']['combat_logs']['Row']
                    );

                    tableKey++;
                }
            }
        )
        .subscribe((status) => {
             // Optional: Log subscription status for debugging
             if (status === 'SUBSCRIBED') {
                 console.log('Realtime channel SUBSCRIBED successfully.');
             } else if (status === 'CHANNEL_ERROR') {
                 console.error('Realtime channel error.');
             }
        });
});

// 5. Cleanup on component unmount
onUnmounted(() => {
    if (combatLogSubscription) {
        console.log('Removing Supabase Realtime subscription...');
        supabase.removeChannel(combatLogSubscription);
    }
});

const onUpload = (event:any,guildName:string) => {
    // The event.xhr.responseText contains the successful JSON string response 
    // from your backend handler.
    try {
        const responseData = JSON.parse(event.xhr.responseText);
        
        console.log('Upload Successful. Received stats:', responseData.stats);

        // OPTIONAL: Store the stats temporarily in a global state (e.g., Pinia)
        // if you need them before the navigation completes.
        
        // Navigate to the results page
        // You might want to pass data as query parameters or use a state store
        // For simplicity, we navigate to a hardcoded results page.
        // router.push('/combat-results');

    } catch (e) {
        console.error('Failed to parse upload response:', e);
        // Handle the error case (e.g., show a toast message)
    }
}
const onRowSelect = (event:any) =>{
    const logId = event.data.id;
    console.log("logID: ", logId);
    navigateTo(`/combat-logger/${logId}`)
}


</script>
<template>
    <div class="w-full min-h-[calc(100vh-40px)] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 py-8 px-4 overflow-auto lg:overflow-hidden">
        <div class="container mx-auto">
            <!-- Header Section -->
            <div class="mb-6">
                <h1 class="text-4xl font-bold text-white mb-2 tracking-tight">Combat Logger</h1>
                <p class="text-zinc-400">Upload and manage your guild combat logs</p>
            </div>

            <!-- Action Bar -->
            <div class="mb-4 flex justify-between items-center">
                <Button 
                    label="Upload New Log" 
                    icon="pi pi-upload"
                    @click="visible = true"
                    class="bg-emerald-600 hover:bg-emerald-700 border-none shadow-lg shadow-emerald-900/50 transition-all"
                />
                <div class="text-md text-zinc-400">
                    <span class="font-semibold text-white">{{ allCombatLogs.length }}</span> total logs
                </div>
                
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                <div class="flex items-center gap-3">
                    <i class="pi pi-exclamation-triangle text-red-400 text-xl"></i>
                    <span class="text-red-300">{{ errorMessage }}</span>
                </div>
            </div>

            <!-- Data Table Card -->
            <div class="bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-zinc-700/50 shadow-2xl overflow-auto lg:overflow-hidden">
                <DataTable 
                    :key="tableKey" 
                    @row-click="onRowSelect"  
                    :value="allCombatLogs" 
                    :paginator="allCombatLogs.length > 10"
                    :rows="10"
                    class="combat-table"
                    stripedRows
                    :rowHover="true"
                    :totalRecords="allCombatLogs.length"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} results"
                >
                    <Column field="type" header="Type" sortable style="width: 15%">
                        <template #body="slotProps">
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
                                :class="slotProps.data.type === 'GvG' 
                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'">
                                {{ slotProps.data.type }}
                            </span>
                        </template>
                    </Column>
                    <Column field="title" header="Name" sortable style="width: 35%">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-file text-zinc-500"></i>
                                <span class="text-white font-medium">{{ slotProps.data.title }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="guild" header="Guild" sortable style="width: 25%">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-users text-zinc-500"></i>
                                <span class="text-zinc-300">{{ slotProps.data.guild }}</span>
                            </div>
                        </template>
                    </Column>
                    <Column field="created_at" header="Created" sortable style="width: 25%">
                        <template #body="slotProps">
                            <div class="flex items-center gap-2 text-zinc-400 text-sm">
                                <i class="pi pi-clock text-zinc-500"></i>
                                {{ toDateTime(slotProps.data.created_at) }}
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>

            <!-- Upload Dialog -->
            <Dialog 
                v-model:visible="visible" 
                modal 
                header="Upload Combat Log" 
                :style="{ width: '32rem' }"
                :dismissableMask="true"
            >
                <div class="flex flex-col gap-6 py-4 mt-2">
                    <FloatLabel>
                        <InputText 
                            v-model="guildName" 
                            id="guild" 
                            class="w-full"  
                        />
                        <label for="guild">Guild Name</label>
                    </FloatLabel>

                    <FloatLabel>
                        <InputText 
                            v-model="logName" 
                            id="name" 
                            class="w-full"  
                        />
                        <label for="name">Log Name</label>
                    </FloatLabel>

                    <div class="flex flex-col gap-2">
                        <label class="text-sm font-medium text-zinc-300">Combat Type</label>
                        <SelectButton 
                            v-model="type" 
                            :options="options"
                            default-value="GvG"
                            class="w-full"
                        />
                    </div>

                    <div class="p-fluid">
                        <FileUpload 
                            :ref="fileUploadRef" 
                            @upload="afterUpload" 
                            @error="onError" 
                            @before-send="onBeforeSend" 
                            :disabled="!guildName" 
                            mode="advanced" 
                            name="demo[]" 
                            url="/api/upload-combat-log" 
                            accept=".log" 
                            :maxFileSize="1000000" 
                            :auto="false" 
                            chooseIcon="pi pi-folder-open"  
                            chooseLabel="Browse Files"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    </div>
</template>

<style scoped>
/* Hide scrollbars */
:deep(.p-datatable-wrapper) {
    overflow: hidden !important;
}

:deep(.p-datatable-table-container) {
    overflow: visible !important;
}

:deep(.p-datatable) {
    background: transparent;
}

:deep(.p-datatable-header) {
    background: transparent;
    border: none;
    padding: 1rem;
}

:deep(.p-datatable-thead > tr > th) {
    background: rgb(24, 24, 27);
    color: rgb(161, 161, 170);
    border: none;
    padding: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
}

:deep(.p-datatable-tbody > tr) {
    background: rgb(24, 24, 27);
    border-bottom: 1px solid rgb(39, 39, 42);
    cursor: pointer;
    transition: all 0.2s ease;
}

:deep(.p-datatable-tbody > tr:hover) {
    background: rgb(39, 39, 42);
    transform: translateX(4px);
}

:deep(.p-datatable-tbody > tr > td) {
    border: none;
    padding: 1rem;
    color: rgb(212, 212, 216);
}

:deep(.p-datatable-tbody > tr.p-row-odd) {
    background: rgb(28, 28, 31);
}

:deep(.p-datatable-tbody > tr.p-row-odd:hover) {
    background: rgb(39, 39, 42);
}

:deep(.p-paginator) {
    background: rgb(24, 24, 27);
    border: none;
    padding: 1rem;
    color: rgb(161, 161, 170);
}

:deep(.p-fileupload-header) {
    display: flex;
    width: 100%;
    justify-content: space-between;
}

:deep(.p-togglebutton.p-component) {
    width: 100%;
}

:deep(.p-selectbutton .p-button) {
    background: rgb(39, 39, 42);
    border-color: rgb(63, 63, 70);
    color: rgb(161, 161, 170);
}

:deep(.p-selectbutton .p-button.p-highlight) {
    background: rgb(52, 211, 153);
    border-color: rgb(52, 211, 153);
    color: rgb(6, 78, 59);
}

:deep(.p-dialog) {
    background: rgb(24, 24, 27);
    border: 1px solid rgb(63, 63, 70);
}

:deep(.p-dialog-header) {
    background: rgb(24, 24, 27);
    color: white;
    border-bottom: 1px solid rgb(63, 63, 70);
}

:deep(.p-dialog-content) {
    background: rgb(24, 24, 27);
    color: rgb(212, 212, 216);
}
</style>
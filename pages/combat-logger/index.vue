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
    const type = ref('GvG');
    const fileUploadRef = ref();
    const errorMessage = ref();
    const visible = ref();
    let combatLogSubscription = null;
    let tableKey = 0;
    const options = ['GvG','NodeWar'];
    
    // SSE Upload state
    const isUploading = ref(false);
    const uploadProgress = ref<{
      stage: string;
      message: string;
      current?: number;
      total?: number;
      charName?: string;
      familyName?: string;
      data?: any;
    }[]>([]);
    const uploadComplete = ref(false);
    const selectedFile = ref<File | null>(null);
    
    // Handle file selection
    const onFileSelect = (event: any) => {
      const files = event.files;
      if (files && files.length > 0) {
        selectedFile.value = files[0];
      }
    };
    
    // Upload with SSE
    const uploadFileWithSSE = async () => {
      if (!selectedFile.value || !guildName.value) {
        errorMessage.value = 'Please select a file and enter guild name';
        return;
      }
    
      uploadProgress.value = [];
      isUploading.value = true;
      uploadComplete.value = false;
      errorMessage.value = null;
    
      try {
        const formData = new FormData();
        formData.append('demo[]', selectedFile.value);
        formData.append('guild', guildName.value);
        formData.append('logName', logName.value || 'Default');
        formData.append('type', type.value || 'GvG');
    
        const response = await fetch('/api/upload-combat-log?stream=true', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'text/event-stream',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
    
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
    
        if (!reader) {
          throw new Error('No response body');
        }
    
        let buffer = '';
        let gameId = null;
    
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
    
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
    
          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.substring(5).trim());
                
                // Add to progress log
                uploadProgress.value.push(data);
    
                // Handle different event types
                console.log("Event type/stage: ",data)
                if (data.stage === 'complete') {
                  uploadComplete.value = true;
                  gameId = data.gameId;
                } else if (data.stage === 'error') {
                  errorMessage.value = data.message;
                }
    
                // Auto-scroll to bottom of progress log
                await nextTick();
                const progressContainer = document.getElementById('progress-log');
                if (progressContainer) {
                  progressContainer.scrollTop = progressContainer.scrollHeight;
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        }
    
        // Navigate to the game page after successful upload
        if (gameId) {
          setTimeout(() => {
            navigateTo(`/combat-logger/${gameId}`);
          }, 1500);
        }
      } catch (error) {
        console.error('Upload error:', error);
        errorMessage.value = error instanceof Error ? error.message : 'Upload failed';
      } finally {
        isUploading.value = false;
      }
    };
    
    // Format progress message for display
    const formatProgressMessage = (progress: typeof uploadProgress.value[0]) => {
      if (progress.current && progress.total) {
        return `[${progress.current}/${progress.total}] ${progress.message}`;
      }
      return progress.message;
    };
    
    // Get icon for stage
    const getStageIcon = (stage: string) => {
      const icons: Record<string, string> = {
        parsing: '📄',
        calculating: '🧮',
        summary: '📊',
        database: '💾',
        scraping: '🔍',
        complete: '✅',
        error: '❌'
      };
      return icons[stage] || '⚙️';
    };
    
    // Close dialog and reset
    const closeDialog = () => {
      visible.value = false;
      uploadProgress.value = [];
      uploadComplete.value = false;
      selectedFile.value = null;
      guildName.value = null;
      logName.value = null;
      type.value = 'GvG';
      errorMessage.value = null;
    };
    
    try {
      const { data, error, status } = await useAsyncData(
        `allCombatLogs`,
        async () => await $fetch<{ data: Database['public']['Tables']['combat_logs']['Row'][]}>('/api/get-combat-log', {
          headers: useRequestHeaders(['cookie']),
          method: "POST",
        }),
        {
          getCachedData(key) {
            return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
          }
        },
      )
      
      if (error.value) {
        console.error('Error fetching games:', error);
      }
      if (data.value && data.value.length > 0) {
        allCombatLogs.value = data.value;
      }
    } catch(error: any) {
      console.log(error);
    }
    
    onMounted(() => {
      console.log('Starting Supabase Realtime subscription...');
      
      combatLogSubscription = supabase
        .channel('combat_log_channel')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'combat_logs' },
          (payload) => {
            console.log('Realtime INSERT event received:', payload);
            
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
          if (status === 'SUBSCRIBED') {
            console.log('Realtime channel SUBSCRIBED successfully.');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Realtime channel error.');
          }
        });
    });
    
    onUnmounted(() => {
      if (combatLogSubscription) {
        console.log('Removing Supabase Realtime subscription...');
        supabase.removeChannel(combatLogSubscription);
      }
    });
    
    const onRowSelect = (event: any) => {
      const logId = event.data.id;
      navigateTo(`/combat-logger/${logId}`);
    };
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
          <div v-if="errorMessage && !visible" class="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
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
    
          <!-- Upload Dialog with SSE Progress -->
          <Dialog 
            v-model:visible="visible" 
            modal 
            header="Upload Combat Log" 
            :style="{ width: '40rem' }"
            :dismissableMask="!isUploading"
            :closable="!isUploading"
            @hide="closeDialog"
          >
            <div class="flex flex-col gap-6 py-4 mt-2">
              <!-- Form inputs (only shown when not uploading) -->
              <div v-if="!isUploading && !uploadComplete" class="flex flex-col gap-6">
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
                  <label for="name">Log Name (Optional)</label>
                </FloatLabel>
    
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-zinc-300">Combat Type</label>
                  <SelectButton 
                    v-model="type" 
                    :options="options"
                    class="w-full"
                  />
                </div>
    
                <div class="p-fluid">
                  <FileUpload 
                    mode="basic" 
                    name="demo[]" 
                    accept=".log" 
                    :maxFileSize="1000000" 
                    :auto="false"
                    chooseLabel="Select Log File"
                    @select="onFileSelect"
                    class="w-full bg-emerald-500! hover:bg-emerald-400!"
                  />
                </div>
    
                <Button 
                  label="Upload" 
                  icon="pi pi-upload"
                  @click="uploadFileWithSSE"
                  :disabled="!guildName || !selectedFile"
                  class="bg-emerald-500! hover:bg-emerald-400! border-none w-full"
                />
              </div>
    
              <!-- Progress Section -->
              <div v-if="isUploading || uploadComplete" class="flex flex-col gap-4">
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold text-white">Upload Progress</h3>
                  <div v-if="isUploading" class="flex items-center gap-2">
                    <i class="pi pi-spin pi-spinner text-emerald-500"></i>
                    <span class="text-sm text-zinc-400">Processing...</span>
                  </div>
                </div>
    
                <!-- Progress Log -->
                <div id="progress-log" class="progress-log">
                  <div 
                    v-for="(progress, index) in uploadProgress" 
                    :key="index"
                    class="progress-item"
                    :class="progress.stage"
                  >
                    <span class="stage-icon">{{ getStageIcon(progress.stage) }}</span>
                    <span class="progress-message">{{ formatProgressMessage(progress) }}</span>
                  </div>
                </div>
    
                <!-- Progress Bar for Scraping -->
                <div 
                  v-if="uploadProgress.length > 0 && uploadProgress[uploadProgress.length - 1].stage === 'scraping' && uploadProgress[uploadProgress.length - 1].total"
                  class="progress-bar-wrapper"
                >
                  <div class="progress-bar-container">
                    <div 
                      class="progress-bar" 
                      :style="{ 
                        width: `${(uploadProgress[uploadProgress.length - 1].current! / uploadProgress[uploadProgress.length - 1].total!) * 100}%` 
                      }"
                    ></div>
                  </div>
                  <div class="text-xs text-zinc-400 text-center mt-1">
                    {{ uploadProgress[uploadProgress.length - 1].current }} / {{ uploadProgress[uploadProgress.length - 1].total }}
                  </div>
                </div>
    
                <!-- Success Message -->
                <div v-if="uploadComplete" class="success-banner">
                  <i class="pi pi-check-circle text-2xl"></i>
                  <div>
                    <p class="font-semibold">Upload Complete!</p>
                    <p class="text-sm opacity-80">Redirecting to combat log...</p>
                  </div>
                </div>
    
                <!-- Error Message -->
                <div v-if="errorMessage && (isUploading || uploadComplete)" class="error-banner">
                  <i class="pi pi-exclamation-triangle text-xl"></i>
                  <span>{{ errorMessage }}</span>
                </div>
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
    
    /* Progress Log Styles */
    .progress-log {
      background: rgb(9, 9, 11);
      border-radius: 8px;
      padding: 1rem;
      max-height: 300px;
      overflow-y: auto;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      border: 1px solid rgb(39, 39, 42);
    }
    
    .progress-item {
      padding: 0.5rem;
      margin-bottom: 0.25rem;
      border-radius: 4px;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      animation: slideIn 0.2s ease;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .progress-item.parsing {
      background: rgba(59, 130, 246, 0.1);
      border-left: 3px solid rgb(59, 130, 246);
    }
    
    .progress-item.calculating {
      background: rgba(168, 85, 247, 0.1);
      border-left: 3px solid rgb(168, 85, 247);
    }
    
    .progress-item.summary {
      background: rgba(34, 197, 94, 0.1);
      border-left: 3px solid rgb(34, 197, 94);
    }
    
    .progress-item.database {
      background: rgba(249, 115, 22, 0.1);
      border-left: 3px solid rgb(249, 115, 22);
    }
    
    .progress-item.scraping {
      background: rgba(236, 72, 153, 0.1);
      border-left: 3px solid rgb(236, 72, 153);
    }
    
    .progress-item.complete {
      background: rgba(34, 197, 94, 0.2);
      border-left: 3px solid rgb(34, 197, 94);
      font-weight: 600;
    }
    
    .progress-item.error {
      background: rgba(239, 68, 68, 0.2);
      border-left: 3px solid rgb(239, 68, 68);
      color: rgb(252, 165, 165);
    }
    
    .stage-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 2px;
    }
    
    .progress-message {
      flex: 1;
      color: rgb(212, 212, 216);
      line-height: 1.5;
    }
    
    .progress-bar-wrapper {
      margin-top: 0.5rem;
    }
    
    .progress-bar-container {
      width: 100%;
      height: 6px;
      background: rgb(39, 39, 42);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, rgb(16, 185, 129), rgb(5, 150, 105));
      transition: width 0.3s ease;
      border-radius: 3px;
    }
    
    .success-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgb(34, 197, 94);
      padding: 1rem;
      border-radius: 8px;
      color: rgb(134, 239, 172);
    }
    
    .error-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgb(239, 68, 68);
      padding: 1rem;
      border-radius: 8px;
      color: rgb(252, 165, 165);
    }
    
    /* Scrollbar styling */
    .progress-log::-webkit-scrollbar {
      width: 6px;
    }
    
    .progress-log::-webkit-scrollbar-track {
      background: rgb(24, 24, 27);
      border-radius: 3px;
    }
    
    .progress-log::-webkit-scrollbar-thumb {
      background: rgb(63, 63, 70);
      border-radius: 3px;
    }
    
    .progress-log::-webkit-scrollbar-thumb:hover {
      background: rgb(82, 82, 91);
    }
    </style>
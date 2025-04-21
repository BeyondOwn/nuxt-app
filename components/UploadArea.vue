<script setup lang="ts">


const fileInput = ref();
const fileInputKey = ref(0);
const files = ref<any[]>([]);
const base64Images = ref<[]>([])
//
const loading = ref(false);
const data = ref<any[]>([]);
const errorState = ref<any[]>([]);
const controllerRef = ref();

type gameTypes = {
    successfulSubmissions: {
        gameId: number,
        message: string
    }[];
    errors?: any[]
    message?: string;
}


function triggerFileInput() {
    fileInput.value?.click();
}

function handleFileSelect(event: any) {
    console.log(event.target.files)
    const selectedFiles: File[] = Array.from(event.target.files);
    processFiles(selectedFiles);
}

function handleFileDrop(event: any) {
    event.preventDefault(); // Prevent default drop behavior
    const droppedFiles: File[] = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
}

async function processFiles(newFiles: File[]) {
    const promises = newFiles.map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                files.value.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    base64: event.target?.result,
                    progress: 0,
                    selected: true
                });
                resolve({
                    name: file.name,
                    base64Image: event.target?.result // event.target.result
                });                      // Resolve with base64 data
            };

            reader.onerror = (error) => {
                console.error('Error reading file:', error);
                reject(error); // Reject the promise on error
            };

            reader.readAsDataURL(file);
        });
    });

    try {
        base64Images.value = await Promise.all(promises) as any; // Wait for all files to be read


    } catch (error) {
        console.error('Error processing files:', error);
        // Handle error (e.g., show a message to the user)
    }
}

function removeFile(index: any) {
    files.value.splice(index, 1);
    fileInputKey.value++;
}

function formatFileSize(bytes: any) {
    if (bytes < 1024) {
        return bytes + 'B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(0) + 'KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
    }
}

async function cancelUpload() {
    controllerRef.value.abort();
    data.value = [];
    errorState.value = [];
    data.value.push("Upload Canceled");
    loading.value = false;
    files.value = [];
}

async function uploadFiles() {
    // Simulate file uploads with progress
    const controller = new AbortController();
    controllerRef.value = controller;
    data.value = [];
    errorState.value = [];

    files.value.forEach((file, index) => {
        simulateUpload(index);
    });
    if (base64Images.value.length > 0) {
        try {
            loading.value = true;
            const processScoreboards: gameTypes =
                await $fetch('/api/create-game', { method: 'POST', body: base64Images.value, signal: controller.signal });
            console.log("scr: ", processScoreboards);

            if (processScoreboards.successfulSubmissions.length > 0 && processScoreboards.errors && processScoreboards.errors.length > 0) {
                processScoreboards.errors.forEach(error => {
                    errorState.value.push(error);
                });
                processScoreboards.successfulSubmissions.forEach(element => {
                    data.value.push(element.message);
                });
                console.log(data.value);
            }
            else {
                data.value.push(processScoreboards.message);
                console.log(data.value);
            }
            loading.value = false;
        }
        catch (error: any) {
            console.log(error.data);
            if (error.data && error.data.errors) {
                error.data.errors.forEach((errorMessage: string) => {
                    errorState.value.push(errorMessage);
                });
            } else if (error.message) {
                console.log(error.message);
            } else {
                console.log("An unexpected error occurred.");
            }
            loading.value = false;
        }
    }
    //     const { data } = await useAsyncData('apples', () => {
    //         return $fetch('/api/insert-apples');
    //     })
    //     console.log("Data:", data.value);
}

function simulateUpload(fileIndex: any) {
    // Reset progress
    files.value[fileIndex].progress = 0;

    const interval = setInterval(() => {
        if (files.value[fileIndex]) {
            files.value[fileIndex].progress += Math.floor(Math.random() * 10) + 5;

            if (files.value[fileIndex].progress >= 100) {
                files.value[fileIndex].progress = 100;
                clearInterval(interval);
            }
        } else {
            clearInterval(interval);
        }
    }, 300);
}
</script>

<template>

    <div class="w-full  light bg-background rounded-xl shadow-lg max-w-2xl  p-6 ">
        <!-- Tabs -->
        <div class="mb-6">
            <div class="border-b border-gray-200">
                <button class="px-6 py-3 font-medium border-b-2 border-gray-900 text-gray-900">
                    My Device
                </button>
            </div>
        </div>

        <!-- Upload area -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6 cursor-pointer"
            @click="triggerFileInput" @dragover.prevent @drop.prevent="handleFileDrop">
            <input ref="fileInput" :key="fileInputKey" type="file" multiple accept="image/*" class="hidden"
                @change="handleFileSelect" />
            <UIcon name="i-heroicons-arrow-up-tray" class="mx-auto mb-4 text-foreground w-10 h-10" />
            <div class="mb-3 text-foreground text-lg">
                Drag and drop or <span class="text-blue-500 font-medium">choose file</span>
            </div>
            <div class="text-foreground">JPEG, PNG, PDF, MP4, MOV</div>
        </div>

        <!-- File list -->
        <div v-if="files.length > 0" class="my-6 max-h-[300px] overflow-y-auto ">
            <div class="text-base font-medium mb-3">{{ files.length }} {{ files.length === 1 ? 'File' : 'Files' }}
            </div>

            <div class="space-y-3">
                <div v-for="(file, index) in files" :key="index"
                    class="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-6 h-6 mr-3">
                            <UCheckbox v-model="file.selected" />
                        </div>
                        <div>
                            <div class="font-medium text-foreground">{{ file.name }}</div>
                            <div class="text-sm text-foreground">{{ formatFileSize(file.size) }}</div>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <!-- <div v-if="file.progress < 100" class="text-sm text-blue-500 mr-3">{{ file.progress }}%
                        </div> -->
                        <button @click="removeFile(index)" class="text-foreground hover:text-foreground/10">
                            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-between space-x-4 mt-6">
            <UButton block variant="solid" class="p-3 text-base text-foreground  bg-red-500 hover:bg-red-600"
                @click="cancelUpload">
                Cancel
            </UButton>

            <UButton block variant="solid" class="p-3 text-base text-foreground bg-green-500 hover:bg-green-600"
                :disabled="!files.length || loading" @click="uploadFiles">
                Upload
            </UButton>
        </div>
        <div
            class="mt-2 font-medium  flex flex-col justify-center items-center text-foreground max-h-[150px] overflow-y-auto">
            <UIcon v-if="loading" name="svg-spinners:bars-rotate-fade" size="32" />
            <span v-if="data.length > 0" class="text-green-500">
                <div v-for="(dat, index) in data" :key="index">{{ dat }}</div>
            </span>
            <span v-if="errorState.length > 0" class="text-red-500">
                <div v-for="(error, index) in errorState" :key="index">{{ error }}</div>
            </span>
        </div>
    </div>

</template>
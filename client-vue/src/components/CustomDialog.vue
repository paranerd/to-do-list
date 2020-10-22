<template>
    <!-- Modal -->
    <div v-if="show" class="z-20 modal fixed w-full h-full top-0 left-0 flex items-center justify-center">
        <button class="absolute w-full h-full bg-gray-900 opacity-50" tabindex="-1" @click="hide()"></button>
        
        <form @submit.prevent="onSubmit" class="bg-white w-11/12 md:max-w-md mx-auto rounded shadow-lg z-50 overflow-y-auto">
            <!-- Add margin if you want to see some of the overlay behind the modal-->
            <div class="modal-content py-4 text-left px-6">
                <!-- Modal Header -->
                <div class="flex justify-between items-center pb-3">
                    <!-- Modal Title -->
                    <p class="text-2xl font-bold">{{title}}</p>

                    <!-- Close button -->
                    <div class="cursor-pointer z-50" @click="hide()">
                        <svg class="fill-current text-black" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path></svg>
                    </div>
                </div>

                <!-- Modal Body -->
                <div v-for="field of fields" :key="field">
                    <label class="block text-gray-700 text-sm font-bold mb-1">{{util.capitalize(field)}}</label>
                    <input v-model="form[field]" name="{{field}}" class="mb-4 h-12 appearance-none w-full text-gray-700 leading-tight focus:outline-none text-base border-b border-teal-500 focus:border-teal-700" type="text" :placeholder="util.capitalize(field)" />
                </div>

                <!-- Modal Footer -->
                <div class="mt-2 flex justify-end pt-2">
                    <button class="px-4 bg-transparent p-3 rounded-lg text-teal-500 hover:bg-teal-500 hover:text-white">{{actionName}}</button>
                    <button class="ml-2 px-4 bg-teal-500 p-3 rounded-lg text-white hover:bg-teal-700" @click="hide()">Close</button>
                </div>

                <!-- Error -->
                <div v-if="error" class="flex justify-center items-center px-4 w-full mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
                    <div class="overflow-auto">
                        {{error}}
                    </div>
                    <span class="tooltip tooltip-left flex justify-center items-center">
                        <span class='tooltip-text'>Copy</span>
                        <button class="ml-2 flex-shrink-0" @click="copyText(error)" type="button">
                            <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </button>
                    </span>
                </div>

                <!-- Success -->
                <div v-if="success" class="flex justify-center items-center px-4 w-full mt-4 bg-teal-100 border border-teal-500 text-green-700 py-3 rounded relative text-center">
                    <div class="overflow-auto">
                        {{success}}
                    </div>
                    <span class="tooltip tooltip-left flex justify-center items-center">
                        <span class='tooltip-text'>{{copyTooltipText}}</span>
                        <button class="text-teal-700 ml-2 flex-shrink-0 flex" @click="copyText(success)" type="button">
                            <svg fill="transparent" class="stroke-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </button>
                    </span>
                </div>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Util from '@/services/util';

export default defineComponent({
    name: 'CustomDialog',
    props: {
        title: String,
        show: Boolean,
        fields: Array,
        error: String,
        success: String,
        actionName: String
    },
    data() {
        const util = new Util();

        return {
            form: {},
            util,
            copyTooltipText: "Copy"
        }
    },
    methods: {
        onSubmit(submitEvent: any) {
            this.$emit('action', this.form);
        },

        hide() {
            this.$emit('update:show', false);
        },

        copyText(val: string){
            const selBox = document.createElement('textarea');
            selBox.style.position = 'fixed';
            selBox.style.left = '0';
            selBox.style.top = '0';
            selBox.style.opacity = '0';
            selBox.value = val;
            document.body.appendChild(selBox);
            selBox.focus();
            selBox.select();
            document.execCommand('copy');
            document.body.removeChild(selBox);

            this.copyTooltipText = "Copied!";

            setTimeout(() => {
                this.copyTooltipText = "Copy";
            }, 5000);
        }
    }
});
</script>
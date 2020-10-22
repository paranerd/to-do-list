<template>
    <div class="flex flex-col justify-center items-center w-11/12 md:w-8/12 xl:w-6/12 mx-auto mt-4 md:mt-8">
        <form @submit.prevent="createItem" class="w-full flex items-center rounded shadow-md py-2 px-3 border-gray-400 border border-solid">
            <input name="name" v-model="name" class="h-12 appearance-none w-full text-gray-700 leading-tight focus:outline-none text-base border-b border-white focus:border-teal-600" placeholder="Add item" autocomplete="off" />
            <button class="ml-4 flex-shrink-0 bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded" type="button">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            </button>
        </form>

        <div class="items w-full">
            <div v-bind:class="item.done ? 'text-gray-500 line-through' : 'text-gray-800'" class="item w-full flex items-center px-2 py-2 mt-6" v-for="item of items" :key="item.id">
                <input type="checkbox" class="form-checkbox rounded text-teal-600 w-6 h-6 border-2 border-gray-400 cursor-pointer" v-bind:checked="item.done" @change="updateItem(item, {done: status.checked})" />
                <span class="item-name w-full ml-3 text-base select-text outline-none" contenteditable="true" @paste.prevent="onPaste(item, $event)" @keydown="onKeydown(item, $event)" @focusout="updateItem(item, {name: create.textContent})">{{item.name}}</span>

                <button class="item-remove flex-shrink-0 hover:bg-gray-200 rounded-full focus:outline-none p-2 hover:text-black" v-on:click="deleteItem(item)">
                    <svg class="fill-current w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ApiService from '@/services/api';
import HistoryService from '@/services/history';
import Item from '@/models/item';

export default defineComponent({
    name: 'Home',
    data() {
        const api = new ApiService();
        const history = new HistoryService();
        const items: Array<Item> = [];

        return {
            name: "",
            api,
            history,
            items
        }
    },
    mounted() {
        this.loadItems();
    },
    methods: {
        async loadItems() {
            this.items = await this.api.getItems();
        },

        async submit(e: any) {
            this.createItem(this.name);
        },

        async createItem(name: string, pos?: number) {
            pos = pos || 0;
            let item = new Item().deserialize({name: this.name, pos});
            this.name = "";

            try {
                // Try creating on the server
                item = await this.api.createItem(item)
            } catch (err) {
                // Save creation for later instead
                item = this.history.create(item);
            } finally {
                // Insert new item at pos
                this.items.splice(pos, 0, item);

                // Reset positions
                this.resetPositions();
            }
        },

        async updateItem(item: Item, update: object = {}) {
            Object.assign(item, update);
            item.modified = Date.now();

            try {
                // Try updating on the server
                item = await this.api.updateItem(item);
            } catch (err) {
                // Save the update for later instead
                item = this.history.update(item);
            } finally {
                // Update items array
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].id === item.id) {
                    this.items[i] = item;
                    break;
                    }
                }

                // Reset positions
                this.resetPositions();
            }
        },

        onPaste(item: Item, e: ClipboardEvent) {
            console.log(e);
        },

        onKeydown(item: Item, e: KeyboardEvent) {
            console.log(e);
        },

        async deleteItem(item: Item) {
            item.modified = Date.now();

            try {
                // Try deleting on the server
                await this.api.deleteItem(item);
            } catch (err) {
                // Save deletion for later instead
                item = this.history.delete(item);
                console.log("err", err);
            } finally {
                // Update items array
                for (let i = 0; i < this.items.length; i++) {
                    if (this.items[i].id === item.id) {
                    this.items.splice(i, 1);
                    break;
                    }
                }
            
                // Reset positions
                this.resetPositions();
            }
        },

        /**
         * Set item positions
         * according to their position in the global array
         */
        resetPositions() {
            for (let i = 0; i < this.items.length; i++) {
            this.items[i].pos = i;
            }
        }
    }
});
</script>

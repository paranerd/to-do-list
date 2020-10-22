<template>
    <div class="flex flex-col justify-center items-center w-11/12 md:w-8/12 xl:w-6/12 mx-auto mt-4 md:mt-8">
        <h1 class="text-5xl text-gray-800">Login</h1>
        <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-11/12 md:w-6/12" @submit.prevent="login()" action="#" method="post">
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="username">Username</label>
                <input v-model="username" name="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none border focus:border-teal-500" type="text" placeholder="Username" required autofocus />
            </div>
            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2" for="password">Password</label>
                <input v-model="password" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none border focus:border-teal-500" type="password" placeholder="******************" required />
            </div>
            <button class="w-full bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" :disabled="loading">
                Login
            </button>

            <!-- Error -->
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 text-center" role="alert" v-if="error">
                <span class="block sm:inline">{{error}}</span>
                </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import AuthService from '@/services/auth';

export default defineComponent({
    name: 'Login',
    data() {
        const auth: AuthService = inject('auth', new AuthService());

        return {
            auth: auth,
            username: "",
            password: "",
            loading: false,
            error: ""
        }
    },
    methods: {
        async login() {
            this.loading = true;

            try {
                await this.auth.login(this.username, this.password);
                this.$router.push({name: 'home'});
            } catch (err) {
                this.error = err;
                this.loading = false;
            }
        }
    }
});
</script>
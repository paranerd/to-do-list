// https://github.com/ErikCH/Vue3TypeScript

import { createStore } from 'vuex';

export default createStore({
    state: {
        currentUser: {},
        counter: 0
    },

    mutations: {
        increment(state, payload) {
            state.counter++;
        },
        setUser(state, payload) {
            state.currentUser = payload;
        }
    },

    actions: {
        increment({commit}) {
            commit('increment');
        }
    },

    getters: {
        counter(state) {
            return state.counter;
        },
        currentUser(state) {
            return state.currentUser;
        }
    }
});
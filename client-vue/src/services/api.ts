
import httpClient from '@/services/httpClient';
import Item from '@/models/item';
import ServiceToken from '@/models/service-token';

export default class ApiService {
    async getItems(): Promise<Array<Item>> {
        const res = await httpClient.get(process.env.VUE_APP_API_URL + '/item');
        const data = res.data.map((itemData: any) => new Item().deserialize(itemData));
        return data;
    }

    async createItem(item: Item): Promise<Item> {
        const res = await httpClient.post(process.env.VUE_APP_API_URL + '/item', item);
        return res.data;
    }

    async updateItem(item: Item): Promise<Item> {
        const res = await httpClient.patch(process.env.VUE_APP_API_URL + '/item', item);
        return res.data;
    }

    async deleteItem(item: Item): Promise<object> {
        const res = await httpClient.delete(process.env.VUE_APP_API_URL + '/item', item);
        return res.data;
    }

    async createServiceToken(name: string): Promise<ServiceToken> {
        const res = await httpClient.post(process.env.VUE_APP_API_URL + '/service-token', {name});
        return res.data;
    }

    async loadServiceTokens(): Promise<Array<ServiceToken>> {
        const res = await httpClient.get(process.env.VUE_APP_API_URL + '/service-token');
        const data = res.data.map((itemData: any) => new ServiceToken().deserialize(itemData));
        return data;
    }

    async deleteServiceToken(id: string) {
        const res = await httpClient.delete(process.env.VUE_APP_API_URL + '/service-token/' + id);
        return res.data;
    }
}

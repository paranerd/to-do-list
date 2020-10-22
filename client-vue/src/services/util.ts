export default class Util {
    public timestampToDate(ts: number) {
        const date = new Date(ts);
        const year = date.getFullYear();
        const month = "0" + (date.getMonth() + 1);
        const day = "0" + date.getDate();
        const hours = date.getHours();
        const minutes = "0" + date.getMinutes();
        const seconds = "0" + date.getSeconds();

        return day.substr(-2) + '.' + month.substr(-2) + '.' + year + ' - ' + hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    }

    /**
     * Capitalize string
     * @param {string} str
     * @returns {string}
     */
    public capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /*public connectionStatus() {
        return merge(
          fromEvent(window, 'online').pipe(map(() => true)),
          fromEvent(window, 'offline').pipe(map(() => false))
        ).pipe(map(data => {
            return data;
        }));
    }*/
}
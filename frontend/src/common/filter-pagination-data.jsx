import axios from "axios";

export const filterPaginationData = async ({ create_new_arr = false, state, data, page, countRoute, data_to_send }) => {
    let obj;

    if (state !== null && !create_new_arr) {
        obj = { ...state, results: [...state.results, ...data], page: page };
    } else {
        try {
            const { data: { totalDocs } } = await axios.post(import.meta.env.VITE_SERVER_URL + countRoute, data_to_send);
            obj = { results: data, page, totalDocs }; 
        } catch (err) {
            console.log(err);
            obj = { results: data, page, totalDocs: 0 }; 
        }
    }

    return obj;
};

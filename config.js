import axios from "axios";
export async function getData(url) {
    return await axios.get(url)
        .then(data => {
            return data.data
        })
        .catch(err => {
            console.log(err);
            return err
        })
}


export async function postData(url, data) {
    return await axios.post(url, data)
        .then(data => {
            // console.log(data);
            return data
        })
        .catch(err => {
            console.log(err);
            return err
        })
}
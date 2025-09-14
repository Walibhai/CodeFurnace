const axios = require('axios');


const getLanguageById = (lang)=>{

        const language = {
                "c++":54,
                "java":62,
                "javascript":63
        }

        return language[lang.toLowerCase()];//C++,JAVA
}

const submitBatch = async (submissions) =>{//inside this function content copy from -- create a batch submission -> Target:Node.js   type:axios 
                const options = {
                method: 'POST',
                url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
                params: {
                  base64_encoded: 'false'//true
                },
                headers: {
                  'x-rapidapi-key': process.env.JUDGE0_KEY,
                  'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                  'Content-Type': 'application/json'
                },
                data: {//submissions already created
                  submissions //i have not encoded my submission code and above i was mentioning that my code was base64_encoded:true by which judge0 try to decode => mene encode kiya hi nahi and judge0 decode karne ka try kar raha hn => base64_encode: false ab judge0 samjh jaayega ki encode nahi kara gaya hn to decode bhi nahi karna hn
                }
              };
              
              async function fetchData() {
                      try {
                              const response = await axios.request(options);
                        //       console.log(response.data);
                                return response.data;
                      } catch (error) {
                              console.error(error);
                      }
              }
              
        //       fetchData();
        return await fetchData();        
}

const waiting = async (timer)=>{
        setTimeout(()=>{
                return 1;
        },timer);
}

const submitToken = async (resultToken)=>{
        // const axios = require('axios');//it is already mention top of the page

        const options = {
        method: 'GET',
        url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
        params: {
        tokens: resultToken.join(","),//our resultToken is a array but here expect as a string with comma seperated (using join array convert into a string)
        base64_encoded: 'false',//true
        fields: '*'
        },
        headers: {
        'x-rapidapi-key': process.env.JUDGE0_KEY,
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
        }; 
 
        async function fetchData() {
                try {
                        const response = await axios.request(options);
                        return response.data;
                } catch (error) {
                        console.error(error);
                }
        }

        while(true){
                const result = await  fetchData();

                const IsResultObtained = result.submissions.every((r)=>r.status_id>2);
                if(IsResultObtained)
                                return result.submissions;
                
                await waiting(1000);//above this function 
        }

}

module.exports  = {getLanguageById,submitBatch,submitToken};
 

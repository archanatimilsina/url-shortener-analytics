import { useState,useCallback } from "react";

export default function useApi(){
    const [loading, setLoading]= useState(false)
    const [error, setError] = useState(null)
    const request = useCallback(async (url, options ={})=>{
        setLoading(true)
        setError(null)
        try{
            const res = await fetch(url,
                {
                    headers: { 'Content-Type':'application/json' },
                    ...options,
                }
            );
            const data = await res.json()
            if(!res.ok)
            {
                return({success: false, status: res.status, data})
            }
            return({success: true, status: res.status, data})
        }catch(err){
            setError("Network error! Please try again")
            return({succes: false, status: null, data: null })
        }finally{
            setLoading(false)
        }
    },[])
    const get= useCallback((url)=>request(url, {method: "GET"}),[request])
    const post = useCallback((url,body)=>request(url,{method:"POST",body: JSON.stringify(body)}),[request])
    return {get, post, loading, error}
}
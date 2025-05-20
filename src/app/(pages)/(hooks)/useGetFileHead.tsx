import { useQuery } from "react-query";

interface Props {
    fetchUrl: string;
    onSuccess?: () => void;
}



export const get_is_doc_editable = (headers: Headers) => {
    const access = headers.get('Access');
    if (!access || access !== 'WRITE') {
        return false;
    }
    return true;
}

const useGetFileHead = ({ fetchUrl, onSuccess }: Props) => {
    // Check if the URL contains special_access_token
    const includeCredentials = !fetchUrl.includes('file_special_access_token');
   
    const {
        data,
        isLoading,
        error,
        isSuccess,
        refetch
    } = useQuery<any, Error>({
        queryKey: [`metadata-${fetchUrl}`],
        queryFn: async () => {
            const res = await fetch(fetchUrl, {
                method: "HEAD",
                credentials: includeCredentials ? "include" : "omit", // Only include credentials when needed
            });
            
            if (!res.ok) {
                throw new Error(`Error fetching metadata: ${res.status} ${res.statusText}`);
            }
            
            if (onSuccess) {
                onSuccess();
            }
            return {editable: get_is_doc_editable(res.headers), headers: res.headers};
        },
    });
    
    return {
        data,
        isLoading,
        error,
        refetch
    };
};

export default useGetFileHead;
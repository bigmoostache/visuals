import { useQuery } from "react-query";

interface Props {
    fetchUrl: string;
    onSucess?: () => void;
}

const useGetFile = ({ fetchUrl, onSucess }: Props) => {
    // Check if the URL contains special_access_token
    const includeCredentials = !fetchUrl.includes('file_special_access_token');
    
    const {
        data,
        isLoading,
        error,
        isSuccess,
        refetch
    } = useQuery<any, Error>({
        queryKey: [fetchUrl],
        queryFn: async () => {
            const res = await fetch(fetchUrl, {
                method: "GET",
                credentials: includeCredentials ? "include" : "omit", // Only include credentials when needed
            });
           
            const blob = await res.blob();
            if (onSucess) {
                onSucess();
            }
            return blob;
        },
    });
    return {
        data,
        isLoading,
        error,
        refetch
    };
};

export default useGetFile;

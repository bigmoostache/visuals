import { useQuery } from "react-query";

interface Props {
    fetchUrl: string;
    onSucess?: () => void;
  }

const useGetFile = ({ fetchUrl, onSucess }: Props) => {
    const {
        data,
        isLoading,
        error,
        isSuccess
    } = useQuery<any, Error>({
        queryKey: [fetchUrl],
        queryFn: async () => {
            const res = await fetch(fetchUrl, {
                method: "GET"
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
    };
};

export default useGetFile;

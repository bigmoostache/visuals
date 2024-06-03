import { useMutation, useQueryClient } from "react-query";
interface Props {
    fetchUrl: string;
  }
const usePatchFile = ({ fetchUrl }: Props) => {
    
  const queryClient = useQueryClient();
  const { mutate, error, isSuccess, isLoading } = useMutation<void, Error, File>({
    mutationFn: async (file) => {
        const form = new FormData();
        form.append('file', file, file.name);
        await fetch(fetchUrl, {
          method: 'POST',
          body: form
        }); 
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [fetchUrl],
        });
      },
    });

    return {
        mutate,
        error,
        isSuccess,
        isLoading
};
};
export default usePatchFile;
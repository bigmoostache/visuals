import { useMutation, useQueryClient } from "react-query";
interface Props {
    fetchUrl: string;
}
const usePatchFile = ({ fetchUrl }: Props) => {
   // Check if the URL contains special_access_token
   const includeCredentials = !fetchUrl.includes('file_special_access_token');
   
   const queryClient = useQueryClient();
   const { mutate, error, isSuccess, isLoading } = useMutation<void, Error, File>({
     mutationFn: async (file) => {
         const form = new FormData();
         form.append('file', file, file.name);
         await fetch(fetchUrl, {
           method: 'POST',
           body: form,
           credentials: includeCredentials ? "include" : "omit", // Only include credentials when needed
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
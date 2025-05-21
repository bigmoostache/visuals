import { useMutation } from "react-query";
interface Props {
    fetchUrl: string;
}
const useUploadFile = ({ fetchUrl }: Props) => {
   // Check if the URL contains special_access_token
   const includeCredentials = !fetchUrl.includes('file_special_access_token');
   
   const { mutate, error, isSuccess, isLoading } = useMutation<void, Error, File>({
     mutationFn: async (file) => {
         const form = new FormData();
         form.append('file', file, file.name);
         const data = await fetch(`${fetchUrl}&create_mode=true`, {
           method: 'POST',
           body: form,
           credentials: includeCredentials ? "include" : "omit", // Only include credentials when needed
         });
          if (!data.ok) {
            throw new Error('Network response was not ok');
          }
          const response = await data.json();
          if (response.error) {
            throw new Error(response.error);
          }
          return response;
       },
       onSuccess: () => {},
     });
     return {
         mutate,
         error,
         isSuccess,
         isLoading
     };
};
export default useUploadFile;
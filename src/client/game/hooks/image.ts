import { useEffect, useState } from "react";

const useImage = (fileName: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [image, setImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await import(`@/assets/${fileName}.jpeg`); // change relative path to suit your needs
        setImage(response.default);
      } catch (err) {
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("Unknown error occurred"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [fileName]);

  return {
    loading,
    error,
    image,
  };
};

export default useImage;

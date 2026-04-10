import { useCallback, useEffect, useState } from "react";

const useFetch = (fetcher, deps = []) => {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");

  const execute = useCallback(async () => {
    setStatus("loading");
    try {
      const result = await fetcher();
      setData(result);
      setStatus("succeeded");
      return result;
    } catch (error) {
      setStatus("failed");
      throw error;
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, status, refetch: execute };
};

export default useFetch;

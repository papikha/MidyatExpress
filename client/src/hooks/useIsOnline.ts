import { useEffect, useState } from 'react'

function useIsOnline() {
    const [isOnline, setIsOnline] = useState(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    useEffect(() =>{
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
    }, [])
  return isOnline
}

export default useIsOnline

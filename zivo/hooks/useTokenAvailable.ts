"use client"

import { useState, useEffect } from "react"
import { SecureStoreService } from "../services/secureStore.service"

/**
 * Token varlığını kontrol eden hook
 * @returns {boolean} Token varsa true, yoksa false döner
 */
export function useTokenAvailable() {
  const [isTokenAvailable, setIsTokenAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    let isMounted = true

    const checkToken = async () => {
      try {
        const token = await SecureStoreService.getItem("zivo_token")
        if (isMounted) {
          setIsTokenAvailable(!!token)
        }
      } catch (error) {
        console.error("Token kontrolü sırasında hata:", error)
        if (isMounted) {
          setIsTokenAvailable(false)
        }
      }
    }

    checkToken()

    return () => {
      isMounted = false
    }
  }, [])

  return isTokenAvailable
}

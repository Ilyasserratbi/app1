"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Delete, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

type CalculatorHistory = {
  calculation: string
  result: string
  timestamp: Date
}

export default function Calculator() {
  const [display, setDisplay] = useState("0")
  const [previousNumber, setPreviousNumber] = useState("")
  const [operation, setOperation] = useState("")
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false)
  const [history, setHistory] = useState<CalculatorHistory[]>([])
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleNumber(e.key)
      } else if (e.key === ".") {
        handleDecimal()
      } else if (e.key === "+") {
        handleOperation("+")
      } else if (e.key === "-") {
        handleOperation("-")
      } else if (e.key === "*") {
        handleOperation("×")
      } else if (e.key === "/") {
        handleOperation("÷")
      } else if (e.key === "Enter" || e.key === "=") {
        handleEqual()
      } else if (e.key === "Escape") {
        handleClear()
      } else if (e.key === "Backspace") {
        handleDelete()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleNumber = (num: string) => {
    if (shouldResetDisplay) {
      setDisplay(num)
      setShouldResetDisplay(false)
    } else {
      setDisplay(display === "0" ? num : display + num)
    }
  }

  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay("0.")
      setShouldResetDisplay(false)
    } else if (!display.includes(".")) {
      setDisplay(display + ".")
    }
  }

  const handleOperation = (op: string) => {
    if (operation && previousNumber) {
      handleEqual()
    }
    setPreviousNumber(display)
    setOperation(op)
    setShouldResetDisplay(true)
  }

  const handleEqual = () => {
    if (!operation || !previousNumber) return

    const prev = Number.parseFloat(previousNumber)
    const current = Number.parseFloat(display)
    let result = 0

    switch (operation) {
      case "+":
        result = prev + current
        break
      case "-":
        result = prev - current
        break
      case "×":
        result = prev * current
        break
      case "÷":
        if (current === 0) {
          setDisplay("Error")
          setPreviousNumber("")
          setOperation("")
          setShouldResetDisplay(true)
          return
        }
        result = prev / current
        break
    }

    const formattedResult = formatNumber(result)
    const calculation = `${previousNumber} ${operation} ${display}`

    setHistory((prev) =>
      [
        {
          calculation,
          result: formattedResult,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 5),
    )

    setDisplay(formattedResult)
    setPreviousNumber("")
    setOperation("")
    setShouldResetDisplay(true)
  }

  const formatNumber = (num: number): string => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(8).replace(/\.?0+$/, "")
  }

  const handleClear = () => {
    setDisplay("0")
    setPreviousNumber("")
    setOperation("")
    setShouldResetDisplay(false)
  }

  const handleDelete = () => {
    if (display.length === 1 || display === "Error") {
      setDisplay("0")
    } else {
      setDisplay(display.slice(0, -1))
    }
  }

  const clearHistory = () => {
    setHistory([])
  }

  return (
    <div className={cn("relative", isDark && "dark")}>
      <motion.div
        className="backdrop-blur-xl bg-white/10 dark:bg-slate-900/90 rounded-[2.5rem] shadow-2xl overflow-hidden w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Display Section */}
        <div className="p-8 pb-0">
          <div className="flex justify-between items-center mb-2">
            <button onClick={() => setIsDark(!isDark)} className="text-slate-400 hover:text-white transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {history.length > 0 && (
              <button onClick={clearHistory} className="text-slate-400 hover:text-red-400 transition-colors">
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="h-28 flex flex-col items-end justify-end text-right">
            {previousNumber && (
              <div className="text-slate-400 dark:text-slate-500 text-lg mb-1">
                {previousNumber} {operation}
              </div>
            )}
            <motion.div
              key={display}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-light tracking-wider text-slate-800 dark:text-white"
            >
              {display}
            </motion.div>
          </div>
        </div>

        {/* History Section */}
        <AnimatePresence>
          {history.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 overflow-hidden"
            >
              <div className="border-t border-slate-200 dark:border-slate-700 my-4" />
              <div className="space-y-2 mb-4">
                {history.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-right"
                  >
                    <div className="text-sm text-slate-400 dark:text-slate-500">{item.calculation}</div>
                    <div className="text-lg font-medium text-slate-800 dark:text-white">= {item.result}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3 p-8">
          {/* First Row */}
          <Button
            variant="ghost"
            className="h-16 text-lg font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/20 dark:hover:bg-red-500/30"
            onClick={handleClear}
          >
            AC
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-lg font-medium bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 dark:bg-slate-400/10 dark:text-slate-400 dark:hover:bg-slate-400/20"
            onClick={handleDelete}
          >
            <Delete className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-lg font-medium bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30"
            onClick={() => handleOperation("÷")}
          >
            ÷
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-lg font-medium bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30"
            onClick={() => handleOperation("×")}
          >
            ×
          </Button>

          {/* Numbers */}
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
            <Button
              key={num}
              variant="ghost"
              className="h-16 text-xl font-medium bg-white/40 hover:bg-white/60 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
              onClick={() => handleNumber(num.toString())}
            >
              {num}
            </Button>
          ))}

          {/* Operators */}
          <Button
            variant="ghost"
            className="h-16 text-lg font-medium bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30"
            onClick={() => handleOperation("-")}
          >
            -
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-lg font-medium bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:bg-violet-500/20 dark:text-violet-400 dark:hover:bg-violet-500/30"
            onClick={() => handleOperation("+")}
          >
            +
          </Button>

          {/* Last Row */}
          <Button
            variant="ghost"
            className="h-16 text-xl font-medium bg-white/40 hover:bg-white/60 text-slate-800 col-span-2 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
            onClick={() => handleNumber("0")}
          >
            0
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-xl font-medium bg-white/40 hover:bg-white/60 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white"
            onClick={handleDecimal}
          >
            .
          </Button>
          <Button
            variant="ghost"
            className="h-16 text-xl font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
            onClick={handleEqual}
          >
            =
          </Button>
        </div>
      </motion.div>
    </div>
  )
}


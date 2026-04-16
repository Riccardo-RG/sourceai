'use client'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] font-bold
          bg-muted text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground
          transition cursor-default select-none leading-none shrink-0"
      >
        ?
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] text-center leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  )
}

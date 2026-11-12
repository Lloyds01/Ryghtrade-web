"use client";

import { Button, StepHeading } from "@/components/ui";

export function RemitaStep({ onAnswer }: { onAnswer: (paidThroughRemita: boolean) => void }) {
  return (
    <div>
      <StepHeading
        title="Are you a salary earner who is paid through Remita?"
        subtitle="This loan is for government workers whose salaries are paid through Remita."
      />
      <div className="space-y-2">
        <Button onClick={() => onAnswer(true)}>Yes</Button>
        <Button variant="ghost" onClick={() => onAnswer(false)}>
          No
        </Button>
      </div>
    </div>
  );
}

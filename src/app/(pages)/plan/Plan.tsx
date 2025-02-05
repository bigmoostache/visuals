"use client";

import { useSearchParams } from 'next/navigation';
import useGetFile from '../(hooks)/useGetFile';
import usePatchFile from '../(hooks)/usePatchFile';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plan as PlanInterface } from './interfaces';
import './planStyles.css';
import { Trash2 } from 'lucide-react';
import LucarioDisplay from './LucarioDisplay';

// New component to handle bullet points input with local state and sufficient height.
const BulletPointsInput = ({ initialBulletText, onBulletChange }: { initialBulletText: string, onBulletChange: (lines: string[]) => void }) => {
  const [bulletText, setBulletText] = useState(initialBulletText);
  useEffect(() => {
    setBulletText(initialBulletText);
  }, [initialBulletText]);
  return (
    <Textarea
      value={bulletText}
      onChange={(e) => setBulletText(e.target.value)}
      onBlur={() => onBulletChange(bulletText.split('\n'))}
      placeholder="Enter bullet points, each on a new line"
      className="plan-textarea"
      style={{ minHeight: "150px" }}
    />
  );
};

const PlanPage = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get('url');
  const { data } = useGetFile({ fetchUrl: url as string });
  const { mutate, isLoading } = usePatchFile({ fetchUrl: url as string });

  const [plan, setPlan] = useState<PlanInterface | null>(null);
  console.log("Plan", plan);
  useEffect(() => {
    if (!data) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as PlanInterface;
        setPlan(parsed);
      } catch (err) {
        console.error("Failed to parse plan JSON", err);
      }
    };
    reader.readAsText(data);
  }, [data]);

  const onSave = () => {
    if (!plan) return;
    const blob = new Blob([JSON.stringify(plan)], { type: 'application/json' });
    const file = new File([blob], 'plan.json', { lastModified: Date.now(), type: blob.type });
    mutate(file);
  };

  const PlanSection = ({ section, onUpdate, onDelete, depth = 0 }: { section: PlanInterface, onUpdate: (updated: PlanInterface) => void, onDelete?: () => void, depth?: number }) => {
    const updateField = (field: keyof PlanInterface, value: any) => {
      onUpdate({ ...section, [field]: value });
    };

    // Local state for title and abstract to prevent input losing focus
    const [localTitle, setLocalTitle] = useState(section.title);
    const [localAbstract, setLocalAbstract] = useState(section.abstract || "");

    useEffect(() => {
      setLocalTitle(section.title);
    }, [section.title]);

    useEffect(() => {
      setLocalAbstract(section.abstract || "");
    }, [section.abstract]);

    return (
      <div className="plan-section">
        <div className="plan-section-header">
          <Input
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={() => updateField("title", localTitle)}
            placeholder="Title"
            className="plan-input"
            style={{ fontWeight: 'bold', fontSize: `${1.5 - 0.1 * depth}em` }}
          />
          {onDelete && (
            <Button className='mt-[5px]' onClick={onDelete}>
              <Trash2 className='h-4 w-4'/>
            </Button>
          )}
        </div>
        <div className="plan-section-body">
          <label className="abstract-label">Abstract:</label>
          <Textarea
            value={localAbstract}
            onChange={(e) => setLocalAbstract(e.target.value)}
            onBlur={() => updateField("abstract", localAbstract)}
            placeholder="Abstract"
            className="plan-textarea"
          />
          {section.section_type === 'leaf' && 'contents' in section && (section.contents as any).leaf_bullet_points !== undefined && (
            <div className="plan-leaf">
              <p>Bullet Points:</p>
              <BulletPointsInput
                initialBulletText={(section.contents as any).leaf_bullet_points.join("\n")}
                onBulletChange={(lines) => updateField("contents", { leaf_bullet_points: lines })}
              />
            </div>
          )}
          {(section.section_type === 'root' || section.section_type === 'node') && 'contents' in section && (section.contents as any).subsections && (
            <div className="plan-subsections">
              <p>Subsections:</p>
              {(section.contents as any).subsections.map((subsection: PlanInterface, index: number) => (
                <div key={subsection.section_id || index} className="plan-subsection">
                  <PlanSection
                    section={subsection}
                    depth={depth + 1}
                    onUpdate={(updatedSub) => {
                      const updatedSubs = (section.contents as any).subsections.slice();
                      updatedSubs[index] = updatedSub;
                      updateField("contents", { subsections: updatedSubs });
                    }}
                    onDelete={() => {
                      const updatedSubs = (section.contents as any).subsections.filter((_: any, i: number) => i !== index);
                      updateField("contents", { subsections: updatedSubs });
                    }}
                  />
                </div>
              ))}
              <Button onClick={() => {
                const newSubsection: PlanInterface = {
                  section_id: Math.random().toString(36).substring(2, 11),
                  prefix: "",
                  title: "New Section",
                  abstract: "",
                  section_type: "leaf",
                  contents: { leaf_bullet_points: [] },
                  references: []
                };
                const updatedSubs = (section.contents as any).subsections ? [...(section.contents as any).subsections, newSubsection] : [newSubsection];
                updateField("contents", { subsections: updatedSubs });
              }}>Add Subsection</Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="plan-page">
      {plan ? (
        <div>
          <Button onClick={onSave} disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
          <PlanSection section={plan} onUpdate={(updated) => setPlan(prev => ({ ...prev, ...updated }))} />
            {plan.lucario && <LucarioDisplay lucario={plan.lucario} />}
        </div>
      ) : (
        <p>Loading plan...</p>
      )}
    </div>
  );
};

export default PlanPage;

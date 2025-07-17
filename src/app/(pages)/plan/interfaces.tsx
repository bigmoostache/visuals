// Import the LUCARIO type if it is defined elsewhere.
// Adjust the import path as necessary.

import { Lucario } from "../lucario/Lucario";

/**
 * Hash of the document, to avoid storing the same document multiple times.
 */
export interface Reference {
  document_hash: string;
  /** Unique identifier for this reference. */
  reference_id: number;
  /** Citation for the reference */
  citation: string;
  /** External identifier for the reference, e.g. DOI */
  external_id?: string;
}

/**
 * Bullet points of topics covered.
 * Provide at least 10, or you will fail at this task.
 */
export interface Leaf {
  leaf_bullet_points: string[];
  target_number_of_words?: number;
}

/**
 * Subsections of this node.
 */
export interface Node {
  subsections: Plan[];
}

/**
 * Represents a section in your document plan.
 */
export interface Plan {
  /** Unique identifier for this plan. It can be anything, as long as it is unique within the document. */
  section_id: string;
  /**
   * Title prefix, examples: "#", "## 1.", "### 1.1.", etc.
   * It can be letters, numbers, or nothing at all, as long as it is consistent throughout the document.
   * Do not include the title itself.
   */
  prefix: string;
  /** Title for this section. Do not re-specify the prefix. */
  title: string;
  /** Short abstract of the section's expected content */
  abstract: string;
  /**
   * Section type:
   * - 'root': root of the whole document,
   * - 'node': meant to have subsections,
   * - 'leaf': meant to have bullet points.
   */
  section_type: 'root' | 'node' | 'leaf';
  /**
   * Contains either:
   * - a `Leaf` with bullet points (if section_type is 'leaf'), or
   * - a `Node` with subsections (if section_type is 'root' or 'node').
   */
  contents: Leaf | Node;
  /** Feedback from the reviewer */
  feedback?: string;
  /** Text of the section */
  text?: string;
  /** References for the section */
  references: Reference[];
  /** Knowledge based information */
  lucario?: Lucario;
}

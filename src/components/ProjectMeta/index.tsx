import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';

import {projects} from '@site/src/data/projects';

import styles from './styles.module.css';

/**
 * Context line and link row for a project page, read from src/data/projects.ts
 * so that /projects, the home page and the project page cannot drift apart.
 */
export default function ProjectMeta({slug}: {slug: string}): ReactNode {
  const project = projects.find((candidate) => candidate.href === slug);
  if (!project) {
    throw new Error(`ProjectMeta: no project registered for "${slug}"`);
  }

  return (
    <div className={styles.meta}>
      <p className={styles.line}>
        {[project.context, project.period].filter(Boolean).join(' · ')}
      </p>
      {project.links.length > 0 && (
        <ul className={styles.links}>
          {project.links.map((link) => (
            <li key={link.href}>
              <Link to={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import {projects} from '@site/src/data/projects';

import styles from './styles.module.css';

const description =
  'Compiler and static-analysis projects by Samuel Malec: abstract interpretation for ' +
  'GraalVM Native Image, the Compiler Dungeon optimising compiler, and Dagon, a ' +
  'JavaScript-to-QuickJS-bytecode toolchain.';

export default function Projects(): ReactNode {
  return (
    <Layout title="Projects" description={description}>
      <main className={styles.page}>
        <Heading as="h1" className={styles.title}>
          Projects
        </Heading>
        <p className={styles.lede}>
          Compilers, intermediate representations and static analysis — one research
          project, one personal compiler, and one faculty-funded toolchain. Each entry
          has its own page with more detail.
        </p>

        <ul className={styles.list}>
          {projects.map((project) => (
            <li key={project.href} className={styles.item}>
              <Heading as="h2" className={styles.itemTitle}>
                <Link to={project.href}>{project.title}</Link>
              </Heading>
              <p className={styles.meta}>
                {[project.context, project.period].filter(Boolean).join(' · ')}
              </p>
              <p className={styles.summary}>{project.summary}</p>
              <ul className={styles.topics}>
                {project.topics.map((topic) => (
                  <li key={topic} className={styles.topic}>
                    {topic}
                  </li>
                ))}
              </ul>
              <ul className={styles.links}>
                <li>
                  <Link to={project.href}>Project page</Link>
                </li>
                {project.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}

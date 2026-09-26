import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import Todo from '@site/src/components/Todo';
import {projects} from '@site/src/data/projects';

import styles from './styles.module.css';

export default function Projects(): ReactNode {
  return (
    <Layout title="Projects">
      <main className={styles.main}>
        <div className="container">
          <Heading as="h1">Projects</Heading>
          <section className={styles.section}>
            {projects.map((project) => (
              <div key={project.href} className={styles.card}>
                <Heading as="h2">
                  <Link to={project.href}>{project.title}</Link>
                </Heading>
                <p>{project.description}</p>
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
              </div>
            ))}
          </section>
        </div>
      </main>
    </Layout>
  );
}

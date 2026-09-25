import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import {projects} from '@site/src/data/projects';
import {recentPosts} from '@site/src/data/posts';
import {contact} from '@site/src/data/site';

import styles from './index.module.css';

const description =
  'Samuel Malec — compiler engineering, programming languages and static analysis. ' +
  'Junior researcher at FI MUNI and Oracle Labs working on abstract interpretation ' +
  'for GraalVM Native Image.';

function SectionHead({title, link}: {title: string; link?: ReactNode}) {
  return (
    <div className={styles.sectionHead}>
      <Heading as="h2" className={styles.sectionTitle}>
        {title}
      </Heading>
      {link ? <span className={styles.sectionLink}>{link}</span> : null}
    </div>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout title="Samuel Malec" description={description}>
      <main className={styles.page}>
        <Heading as="h1" className={styles.name}>
          Samuel Malec
        </Heading>
        <p className={styles.tagline}>{contact.tagline}</p>

        <div className={styles.intro}>
          <p>
            I am an M.Sc. student in Theoretical Computer Science at the Faculty of
            Informatics, Masaryk University in Brno. Since 2024 I have worked as a
            junior researcher at FI MUNI together with Oracle Labs on static
            analysis for GraalVM Native Image — abstract interpretation over the
            Sea-of-Nodes IR, and context-sensitive interprocedural analysis.
          </p>
          <p>
            Before that I spent close to a year writing industrial C++ at SANEZOO,
            and I have been teaching introductory programming seminars in Python
            and C at the faculty since 2023. Outside of that I write my own
            compilers, mostly to work through ideas end to end: type inference,
            SSA construction, and optimisation passes on small but complete
            pipelines.
          </p>
        </div>

        <ul className={styles.contactLine}>
          <li>
            <Link href={contact.github}>GitHub</Link>
          </li>
          <li>
            <Link href={contact.linkedin}>LinkedIn</Link>
          </li>
          <li>
            <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
          </li>
        </ul>

        <section className={styles.section}>
          <SectionHead
            title="Selected work"
            link={<Link to="/projects">All projects →</Link>}
          />
          <ul className={styles.entries}>
            {projects.map((project) => (
              <li key={project.href} className={styles.entry}>
                <h3 className={styles.entryTitle}>
                  <Link to={project.href}>{project.title}</Link>
                </h3>
                <p className={styles.entryMeta}>
                  {[project.context, project.period].filter(Boolean).join(' · ')}
                </p>
                <p className={styles.entryText}>{project.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <SectionHead
            title="Latest posts"
            link={<Link to="/blog">All posts →</Link>}
          />
          <ul className={styles.postList}>
            {recentPosts.map((post) => (
              <li key={post.href} className={styles.post}>
                <time className={styles.postDate}>{post.date}</time>
                <Link to={post.href}>{post.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
}

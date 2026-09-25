import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {usePluginData} from '@docusaurus/useGlobalData';

import Avatar from '@site/src/components/Avatar';
import Todo from '@site/src/components/Todo';
import {projects} from '@site/src/data/projects';

import styles from './index.module.css';

type WritingEntry = {
  title: string;
  permalink: string;
  date: string;
  source: string;
};

function HomepageHeader() {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={styles.title}>
          Hello there 👋
        </Heading>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/blog">
            Posts
          </Link>
        </div>
      </div>
    </header>
  );
}

function Latest() {
  const {entries} = usePluginData('recent-writing') as {
    entries: WritingEntry[];
  };

  if (entries.length === 0) {
    return <p>Nothing published yet.</p>;
  }

  return (
    <ul className={styles.postList}>
      {entries.map((entry) => (
        <li key={entry.permalink} className={styles.post}>
          <time className={styles.postDate} dateTime={entry.date}>
            {entry.date}
          </time>
          <Link to={entry.permalink}>{entry.title}</Link>
          {entry.source === 'note' && (
            <span className={styles.tag}>note</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout title="Home">
      <HomepageHeader />

      <main className={styles.main}>
        <section id="about" className={styles.section}>
          <div className="container">
            <div className={clsx(styles.card, styles.bioCard)}>
              <div className={styles.bio}>
                <Heading as="h2">Whoami</Heading>

                <p>I'm Sam, a MSc theoretical computer science student at FI MUNI in Brno.</p>
                <p> My main areas of interest are: programming language design, compiler development and static analysis/formal verification. </p>
                <p>
                  This blog is a place where I share notes, ideas, and things I learn along the way that I think others might find interesting.
                </p>
                <p>
                  <i>All opinions presented here are my personal opinions and do not reflect the opinion of my employer.</i>
                </p>
              </div>
              <Avatar
                className={styles.bioPhoto}
                src="/img/profile_pic.jpg"
                alt="Samuel Malec"
                size={96}
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.card}>
              <Heading as="h2">Now</Heading>
              <Todo>
                A line or two on what you are working on at the moment. The
                longer version lives on the <Link to="/now">now page</Link>.
              </Todo>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.card}>
              <Heading as="h2">Selected work</Heading>
              <ul className={styles.entries}>
                {projects.map((project) => (
                  <li key={project.href} className={styles.entry}>
                    <h3 className={styles.entryTitle}>
                      <Link to={project.href}>{project.title}</Link>
                    </h3>
                    <Todo inline>One line on what this is.</Todo>
                  </li>
                ))}
              </ul>
              <p className={styles.more}>
                <Link to="/projects">All projects →</Link>
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.card}>
              <Heading as="h2">Latest</Heading>
              <Latest />
              <p className={styles.more}>
                <Link to="/blog">All posts</Link> ·{' '}
                <Link to="/notes">All notes</Link> ·{' '}
                <Link to="/reading">Reading list</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

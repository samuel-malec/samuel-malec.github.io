import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

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

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
    >
      <HomepageHeader />

      <main className={styles.main}>
        <section id="about" className={styles.section}>
          <div className="container">
            <div className={styles.card}>
              <Heading as="h2">Whoami</Heading>
              <p>I'm Sam, a 23 year old computer science student at FI MUNI in Brno.</p>    
                <p>Ever since I started programming, I've wanted to write my own programming language.
                Back then, the idea of creating a language seemed really cool to me.
                I guess this curiosity eventually led me to explore compiler development, programming language design, and static analysis.
                </p>
                <p>
                This blog is a place where I share notes, ideas, and things I learn along the way that I think others might find interesting.
                </p>
                <p>
                <i>All opinions presented here are my personal opinions and do not reflect the opinion of my employer.</i>
              </p>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
}

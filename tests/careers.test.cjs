const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(join(__dirname, '..', 'script.js'), 'utf8');
const sampleJob = {
  title: 'Image Labeling', role: 'Image Annotation Specialist',
  status: 'Open', responsibilities: ['Review every label.']
};

function loadPage(fetchResponse) {
  const grid = { innerHTML: 'Loading', querySelectorAll: () => [] };
  const select = {
    innerHTML: '', options: [], addEventListener() {},
    appendChild(option) { this.options.push(option); }
  };
  const elements = { jobsGrid: grid, jobSelect: select };
  const warnings = [];
  const context = vm.createContext({
    document: {
      getElementById: id => elements[id] || null,
      querySelectorAll: () => [],
      createElement: () => ({})
    },
    window: {
      matchMedia: () => ({ matches: true }),
      addEventListener() {},
      setTimeout: (callback, delay) => setTimeout(callback, Math.min(delay, 20)),
      clearTimeout,
      scrollY: 0
    },
    AbortController,
    console: { warn: warning => warnings.push(warning) },
    fetch: fetchResponse
  });
  vm.runInContext(source, context);
  return { grid, select, warnings };
}

async function waitForJobs(page) {
  const deadline = Date.now() + 500;
  while (page.grid.innerHTML === 'Loading' && Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, 5));
  }
  assert.notEqual(page.grid.innerHTML, 'Loading', 'job loading must finish');
}

function stalledRequest(options) {
  return new Promise((resolve, reject) => {
    options.signal?.addEventListener('abort', () => reject(new Error('Request aborted')));
  });
}

test('a successfully loaded empty board shows the no-open-projects message', async () => {
  const page = loadPage(async url => ({ ok: true, json: async () => url.startsWith('jobs.json') ? { jobs: [] } : [] }));
  await waitForJobs(page);
  assert.match(page.grid.innerHTML, /no open projects/i);
  assert.doesNotMatch(page.grid.innerHTML, /could not be loaded/i);
});

test('failure of both job sources displays a loading error', async () => {
  const page = loadPage(async () => { throw new Error('Network unavailable'); });
  await waitForJobs(page);
  assert.match(page.grid.innerHTML, /could not be loaded/i);
  assert.equal(page.warnings.length, 2);
});

test('static jobs remain available when the GitHub request stalls', async () => {
  const page = loadPage(async (url, options = {}) => url.startsWith('jobs.json')
    ? { ok: true, json: async () => ({ jobs: [sampleJob] }) }
    : stalledRequest(options));
  await waitForJobs(page);
  assert.match(page.grid.innerHTML, /Image Labeling/);
  assert.equal(page.select.options[0].value, sampleJob.title);
});

test('GitHub jobs remain available when the static request stalls', async () => {
  const issue = {
    number: 1, title: '[CAREER JOB]',
    body: '### Job title\nImage Labeling\n\n### Role\nImage Annotation Specialist\n\n### Responsibilities\n- Review every label.'
  };
  const page = loadPage(async (url, options = {}) => url.startsWith('jobs.json')
    ? stalledRequest(options)
    : { ok: true, json: async () => [issue] });
  await waitForJobs(page);
  assert.match(page.grid.innerHTML, /Image Labeling/);
  assert.equal(page.select.options[0].value, sampleJob.title);
});

test('a response body that stalls is also aborted', async () => {
  const page = loadPage(async (url, options = {}) => ({
    ok: true,
    json: () => url.startsWith('jobs.json')
      ? Promise.resolve({ jobs: [sampleJob] })
      : stalledRequest(options)
  }));
  await waitForJobs(page);
  assert.match(page.grid.innerHTML, /Image Labeling/);
});

test('closed jobs stay out of both the board and application dropdown', async () => {
  const page = loadPage(async url => ({ ok: true, json: async () => url.startsWith('jobs.json')
    ? { jobs: [{ ...sampleJob, status: 'Closed' }] } : [] }));
  await waitForJobs(page);
  assert.match(page.grid.innerHTML, /no open projects/i);
  assert.equal(page.select.options.length, 0);
});

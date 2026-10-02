import { performance } from 'perf_hooks';
import { MaxComplaintPriorityQueue } from '../dsa/complaintPriorityQueue';
import { ComplaintProcessingQueue } from '../dsa/complaintProcessingQueue';
import { ComplaintHashMap } from '../dsa/complaintHashMap';
import { DepartmentGraph } from '../dsa/departmentGraph';
import { ComplaintRoutingService, buildCategoryToDepartmentMap } from '../dsa/complaintRouting';
import { mergeSort, quickSort } from '../algorithms/sorting/sorting';
import { linearSearch, binarySearch } from '../algorithms/searching/searching';

// Benchmark configuration
const SIZES = [100, 1000, 5000, 10000];
const ITERATIONS = 5; // average across iterations

function hrToMs(n: number) {
  return Number(n.toFixed(3));
}

function timeFn(fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
}

function averageTimes(times: number[]) {
  return times.reduce((a, b) => a + b, 0) / times.length;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

async function runBenchmarks() {
  console.log('Running SCRS ADSA benchmarks (iterations:', ITERATIONS, ')');
  console.log('Note: timings depend on hardware, Node.js version, dataset size, input distribution, and system load. Results are illustrative only.');
  console.log('');

  // Prepare result rows
  const rows: Array<Record<string, any>> = [];

  for (const n of SIZES) {
    console.log(`\n--- Input size: ${n} ---`);

    // Prepare synthetic data
    const numbers = new Array(n).fill(0).map(() => Math.random());
    const objects = numbers.map((v, i) => ({ id: `id-${i}`, value: v }));

    // Heap: enqueue and extract
    const heapEnqueueTimes: number[] = [];
    const heapExtractTimes: number[] = [];
    for (let it = 0; it < ITERATIONS; it += 1) {
      const heap = new MaxComplaintPriorityQueue();
      const enqueueTime = timeFn(() => {
        for (let i = 0; i < n; i += 1) {
          heap.enqueue({ id: `h-${i}`, title: 't', priorityScore: numbers[i], createdAt: new Date() } as any);
        }
      });

      heapEnqueueTimes.push(enqueueTime);

      const extractTime = timeFn(() => {
        while (!heap.isEmpty()) {
          heap.extract();
        }
      });

      heapExtractTimes.push(extractTime);
    }

    rows.push({ Algorithm: 'Heap Enqueue (avg ms)', Size: n, Time: hrToMs(averageTimes(heapEnqueueTimes)) });
    rows.push({ Algorithm: 'Heap Extract All (avg ms)', Size: n, Time: hrToMs(averageTimes(heapExtractTimes)) });

    // Processing Queue: enqueue and dequeue
    const queueEnqTimes: number[] = [];
    const queueDeqTimes: number[] = [];
    for (let it = 0; it < ITERATIONS; it += 1) {
      const q = new ComplaintProcessingQueue();
      const enq = timeFn(() => {
        for (let i = 0; i < n; i += 1) {
          q.enqueue({ id: `q-${i}`, title: 't', createdAt: new Date() } as any);
        }
      });
      queueEnqTimes.push(enq);

      const deq = timeFn(() => {
        while (!q.isEmpty()) {
          q.dequeue();
        }
      });
      queueDeqTimes.push(deq);
    }

    rows.push({ Algorithm: 'Queue Enqueue (avg ms)', Size: n, Time: hrToMs(averageTimes(queueEnqTimes)) });
    rows.push({ Algorithm: 'Queue Dequeue (avg ms)', Size: n, Time: hrToMs(averageTimes(queueDeqTimes)) });

    // Hash Map: set/get/delete
    const mapSetTimes: number[] = [];
    const mapGetTimes: number[] = [];
    const mapDelTimes: number[] = [];
    for (let it = 0; it < ITERATIONS; it += 1) {
      const map = new ComplaintHashMap<any>(Math.max(16, Math.floor(n / 4)));
      const setT = timeFn(() => {
        for (let i = 0; i < n; i += 1) map.set(`k-${i}`, { v: numbers[i] });
      });
      mapSetTimes.push(setT);

      const getT = timeFn(() => {
        for (let i = 0; i < n; i += 1) map.get(`k-${randomInt(n)}`);
      });
      mapGetTimes.push(getT);

      const delT = timeFn(() => {
        for (let i = 0; i < n; i += 1) map.delete(`k-${i}`);
      });
      mapDelTimes.push(delT);
    }

    rows.push({ Algorithm: 'HashMap Set (avg ms)', Size: n, Time: hrToMs(averageTimes(mapSetTimes)) });
    rows.push({ Algorithm: 'HashMap Get (avg ms)', Size: n, Time: hrToMs(averageTimes(mapGetTimes)) });
    rows.push({ Algorithm: 'HashMap Delete (avg ms)', Size: n, Time: hrToMs(averageTimes(mapDelTimes)) });

    // Department Graph + Dijkstra routing
    // Build a linear connected graph with some extra edges for variety
    const graphBuildTimes: number[] = [];
    const dijkstraTimes: number[] = [];
    for (let it = 0; it < Math.min(3, ITERATIONS); it += 1) {
      const g = new DepartmentGraph();
      const buildT = timeFn(() => {
        for (let i = 0; i < n; i += 1) {
          g.addVertex({ id: `n-${i}`, name: `Node ${i}`, code: `N${i}` });
        }
        for (let i = 0; i < n - 1; i += 1) g.addEdge(`n-${i}`, `n-${i + 1}`, 1);
        // add a few random shortcuts
        for (let i = 0; i < Math.min(10, Math.floor(n / 100)); i += 1) {
          const a = randomInt(n - 2);
          const b = Math.min(n - 1, a + 2 + randomInt(Math.max(1, Math.floor(n / 10))));
          g.addEdge(`n-${a}`, `n-${b}`, 1 + randomInt(5));
        }
      });
      graphBuildTimes.push(buildT);

      const routing = new ComplaintRoutingService(buildCategoryToDepartmentMap(), g, 'n-0');
      const dT = timeFn(() => {
        // route from first to last using a dummy category mapped to last vertex
        routing.routeComplaint({ category: 'WATER_SUPPLY', priorityScore: 0 }, 'n-0');
      });
      dijkstraTimes.push(dT);
    }

    rows.push({ Algorithm: 'Graph Build (avg ms)', Size: n, Time: hrToMs(averageTimes(graphBuildTimes)) });
    rows.push({ Algorithm: 'Dijkstra Route (avg ms)', Size: n, Time: hrToMs(averageTimes(dijkstraTimes)) });

    // Sorting: Merge vs Quick
    const mergeTimes: number[] = [];
    const quickTimes: number[] = [];
    for (let it = 0; it < Math.max(1, Math.floor(ITERATIONS)); it += 1) {
      const arr = objects.map((o) => ({ ...o }));
      const arr2 = objects.map((o) => ({ ...o }));

      const m = timeFn(() => {
        mergeSort(arr, (a, b) => a.value - b.value);
      });
      mergeTimes.push(m);

      const q = timeFn(() => {
        quickSort(arr2, (a, b) => a.value - b.value);
      });
      quickTimes.push(q);
    }

    rows.push({ Algorithm: 'Merge Sort (avg ms)', Size: n, Time: hrToMs(averageTimes(mergeTimes)) });
    rows.push({ Algorithm: 'Quick Sort (avg ms)', Size: n, Time: hrToMs(averageTimes(quickTimes)) });

    // Searching: Linear vs Binary (binary needs sorted input)
    const linearTimes: number[] = [];
    const binaryTimes: number[] = [];
    for (let it = 0; it < ITERATIONS; it += 1) {
      const arr = objects.map((o) => ({ ...o }));
      const target = arr[randomInt(n)];

      const lin = timeFn(() => {
        linearSearch(arr, target, (item, t) => (item.id === t.id ? 0 : 1));
      });
      linearTimes.push(lin);

      const sorted = mergeSort(arr, (a, b) => a.id.localeCompare(b.id));
      const bin = timeFn(() => {
        binarySearch(sorted, target, (item, t) => item.id.localeCompare(t.id));
      });
      binaryTimes.push(bin);
    }

    rows.push({ Algorithm: 'Linear Search (avg ms)', Size: n, Time: hrToMs(averageTimes(linearTimes)) });
    rows.push({ Algorithm: 'Binary Search (avg ms)', Size: n, Time: hrToMs(averageTimes(binaryTimes)) });

    // Print a chunk of results for this size
    console.table(rows.slice(-12));
  }

  console.log('\nFull summary (last recorded rows):');
  console.table(rows);
  console.log('\nBenchmarks complete. Remember: these numbers are illustrative, not universal.');
}

runBenchmarks().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});

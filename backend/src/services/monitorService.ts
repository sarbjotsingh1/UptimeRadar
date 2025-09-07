import axios from "axios";
import prisma from "../prisma.js";

type EndpointType = {
  id: string;
  url: string;
  intervalSec: number;
  isActive: boolean;
};

// Map to keep track of active timers
const timers = new Map<string, ReturnType<typeof setInterval>>();


// Function to check a single endpoint
const checkEndpoint = async (endpoint: EndpointType) => {
  const ep = await prisma.endpoint.findUnique({ where: { id: endpoint.id } });
  if (!ep || !ep.isActive) return;

  const start = Date.now();
  let status = "DOWN";
  let responseMs: number | null = null;

  try {
    const res = await axios.get(ep.url, { timeout: 5000 });
    status = res.status === 200 ? "UP" : "DOWN";
    responseMs = Date.now() - start;
  } catch (err) {
    console.error(`Endpoint ${ep.url} is DOWN`);
  }

  await prisma.endpointCheck.create({
    data: {
      endpointId: ep.id,
      status,
      responseMs,
    },
  });

  console.log(`Checked ${ep.url}: ${status} in ${responseMs}ms`);
};

// Schedule or reschedule an endpoint
export const scheduleEndpoint = (endpoint: EndpointType) => {
  // Clear existing timer if it exists
  if (timers.has(endpoint.id)) {
    clearInterval(timers.get(endpoint.id)!);
  }

  if (!endpoint.isActive) {
    // Do not schedule inactive endpoints
    timers.delete(endpoint.id);
    return;
  }

  // Run immediately
  checkEndpoint(endpoint);

  // Schedule repeated checks per intervalSec
  const timer = setInterval(() => checkEndpoint(endpoint), endpoint.intervalSec * 1000);
  timers.set(endpoint.id, timer);
};

// Initialize monitoring for all endpoints
export const initMonitoring = async () => {
  const endpoints = await prisma.endpoint.findMany();
  endpoints.forEach(scheduleEndpoint);
};

// Update a single endpoint dynamically
export const updateEndpointSchedule = async (endpointId: string) => {
  const endpoint = await prisma.endpoint.findUnique({ where: { id: endpointId } });
  if (endpoint) scheduleEndpoint(endpoint);
};

// Stop monitoring an endpoint
export const stopEndpointSchedule = (endpointId: string) => {
  const timer = timers.get(endpointId);
  if (timer) {
    clearInterval(timer); // Node.js timer type is OK if timers map is typed correctly
    timers.delete(endpointId);
    console.log(`Stopped monitoring for endpoint ${endpointId}`);
  }
};
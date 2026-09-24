/**
 * Unisole Roadshow & Presentation End-to-End Stress Test
 *
 * Simulates a real college auditorium session with N concurrent students:
 * 1. Admin creates and launches a live session (Sanjauli College PPT)
 * 2. N students simultaneously hit HTTP POST /join (scanning QR code)
 * 3. N students connect via WebSocket and join the presentation room
 * 4. Admin navigates slides (broadcast to all N students)
 * 5. Students fire floating emoji reactions
 * 6. Admin launches a live Quiz; all N students submit answers within seconds
 * 7. Measures HTTP latency, WebSocket broadcast latency, ack times, and error rates
 *
 * Usage:
 *   npx tsx src/scripts/stress-test-roadshow.ts [studentCount]
 * Example:
 *   npx tsx src/scripts/stress-test-roadshow.ts 250
 */

import { io as SocketClient, Socket } from "socket.io-client";
import { pool } from "../db";
import { presentationsRepository } from "../repositories/presentations.repository";

const SERVER_URL = process.env.STRESS_TARGET_URL || "http://localhost:3000";
const STUDENT_COUNT = Number(process.argv[2]) || 100;

interface StudentVU {
  index: number;
  name: string;
  phone: string;
  branch: string;
  year: string;
  leadId?: string;
  socket?: Socket;
  httpJoinTimeMs?: number;
  socketConnectTimeMs?: number;
  quizAckTimeMs?: number;
}

function getPercentile(arr: number[], percentile: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Math.round(sorted[Math.max(0, index)] * 10) / 10;
}

function stats(arr: number[]) {
  if (arr.length === 0) return { min: 0, avg: 0, p50: 0, p95: 0, p99: 0, max: 0 };
  const sum = arr.reduce((a, b) => a + b, 0);
  return {
    min: Math.round(Math.min(...arr) * 10) / 10,
    avg: Math.round((sum / arr.length) * 10) / 10,
    p50: getPercentile(arr, 50),
    p95: getPercentile(arr, 95),
    p99: getPercentile(arr, 99),
    max: Math.round(Math.max(...arr) * 10) / 10,
  };
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runStressTest() {
  console.log("\n=======================================================");
  console.log("  🚀 UNISOLE ROADSHOW END-TO-END STRESS TEST (LOCAL)  ");
  console.log("=======================================================");
  console.log(`Target Engine Server: ${SERVER_URL}`);
  console.log(`Virtual Students:     ${STUDENT_COUNT}`);
  console.log(`Target Presentation:  pres_sanjauli_college_ppt\n`);

  // Step 0: Ensure local server is responsive
  try {
    const healthCheck = await fetch(`${SERVER_URL}/health`);
    if (!healthCheck.ok) {
      throw new Error(`Server returned status ${healthCheck.status}`);
    }
  } catch (err: any) {
    console.error(`❌ Target server at ${SERVER_URL} is not reachable!`);
    console.error(`   Please make sure the engine is running (e.g. npm run dev).`);
    process.exit(1);
  }

  // Step 1: Create or fetch presentation session for testing
  const sessionCode = `STRESS${Math.floor(100 + Math.random() * 900)}`;
  console.log(`[1/7] Creating fresh test session with code [${sessionCode}]...`);

  let session: any;
  try {
    session = await presentationsRepository.createSession({
      collegeId: "col_1",
      presentationId: "pres_sanjauli_college_ppt",
      collegeName: "Centre of Excellence Government College, Sanjauli",
      sessionCode,
      status: "LIVE",
      currentSlideIndex: 0,
      activeAttendeesCount: 0,
    });
  } catch (err: any) {
    console.error("❌ Failed to create session in DB:", err.message);
    process.exit(1);
  }

  console.log(`      Session created! ID: ${session.id}`);

  // Step 2: Connect Admin Presenter Socket
  console.log(`[2/7] Connecting Admin Presenter Socket...`);
  const adminSocket = SocketClient(SERVER_URL, {
    transports: ["websocket"],
    reconnection: false,
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Admin socket connect timeout")), 5000);
    adminSocket.on("connect", () => {
      clearTimeout(timer);
      adminSocket.emit("admin:join", {
        sessionCode,
        sessionId: session.id,
      });
      resolve();
    });
    adminSocket.on("connect_error", (e) => reject(e));
  });
  console.log(`      Admin Presenter joined room session:${sessionCode}`);

  // Step 3: Simulate Virtual Students QR Registration (HTTP POST /join)
  console.log(`\n[3/7] Simulating ${STUDENT_COUNT} students scanning QR code (HTTP POST /join)...`);
  const branches = ["BCA", "B.Sc IT", "B.Tech CSE", "MCA", "General"];
  const students: StudentVU[] = [];

  for (let i = 1; i <= STUDENT_COUNT; i++) {
    students.push({
      index: i,
      name: `Student Test ${i}`,
      phone: `9816${String(1000000 + i).slice(1)}`,
      branch: branches[i % branches.length],
      year: `${(i % 3) + 1}st Year`,
    });
  }

  const httpStart = performance.now();
  const httpLatencies: number[] = [];
  let httpSuccess = 0;
  let httpFailed = 0;

  // Fire requests concurrently in batches of 50 to avoid local OS ephemeral port exhaustion
  const batchSize = 50;
  for (let i = 0; i < students.length; i += batchSize) {
    const chunk = students.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (student) => {
        const start = performance.now();
        try {
          const res = await fetch(
            `${SERVER_URL}/api/public/presentations/sessions/${sessionCode}/join`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: student.name,
                phone: student.phone,
                branch: student.branch,
                yearOfStudy: student.year,
              }),
            }
          );
          const elapsed = performance.now() - start;
          httpLatencies.push(elapsed);
          student.httpJoinTimeMs = elapsed;

          if (res.ok) {
            const data: any = await res.json();
            student.leadId = data?.data?.lead?.id;
            httpSuccess++;
          } else {
            const errText = await res.text();
            if (httpFailed === 0) {
              console.error(`      ⚠️ First HTTP Error [${res.status}]:`, errText);
            }
            httpFailed++;
          }
        } catch (e: any) {
          if (httpFailed === 0) {
            console.error("      ⚠️ First HTTP Exception:", e.message);
          }
          httpFailed++;
        }
      })
    );
  }
  const httpTotalElapsed = performance.now() - httpStart;
  const httpStats = stats(httpLatencies);
  console.log(`      HTTP Registration Completed in ${(httpTotalElapsed / 1000).toFixed(2)}s`);
  console.log(`      Success: ${httpSuccess}/${STUDENT_COUNT} | Failed: ${httpFailed}`);
  console.log(`      Latency (ms) -> Min: ${httpStats.min} | Avg: ${httpStats.avg} | P50: ${httpStats.p50} | P95: ${httpStats.p95} | P99: ${httpStats.p99} | Max: ${httpStats.max}`);

  // Step 4: Simulate Virtual Students Opening WebSockets & Joining Room
  console.log(`\n[4/7] Connecting ${httpSuccess} students to WebSocket & emitting audience:join...`);
  const socketStart = performance.now();
  const socketConnectLatencies: number[] = [];
  let socketSuccess = 0;
  let socketFailed = 0;

  const validStudents = students.filter((s) => s.leadId);

  // Connect sockets with slight stagger (10ms between chunks of 25)
  for (let i = 0; i < validStudents.length; i += 25) {
    const chunk = validStudents.slice(i, i + 25);
    await Promise.all(
      chunk.map((student) => {
        return new Promise<void>((resolve) => {
          const start = performance.now();
          const s = SocketClient(SERVER_URL, {
            transports: ["websocket"],
            reconnection: false,
            timeout: 8000,
          });
          student.socket = s;

          s.on("connect", () => {
            s.emit("audience:join", {
              sessionCode,
              leadId: student.leadId,
              studentName: student.name,
              phone: student.phone,
              branch: student.branch,
              yearOfStudy: student.year,
            });
          });

          s.once("sync_state", () => {
            const elapsed = performance.now() - start;
            socketConnectLatencies.push(elapsed);
            student.socketConnectTimeMs = elapsed;
            socketSuccess++;
            resolve();
          });

          s.on("connect_error", () => {
            socketFailed++;
            resolve();
          });

          setTimeout(() => {
            if (!student.socketConnectTimeMs) {
              socketFailed++;
              resolve();
            }
          }, 8000);
        });
      })
    );
    await sleep(20);
  }

  const socketTotalElapsed = performance.now() - socketStart;
  const sockStats = stats(socketConnectLatencies);
  console.log(`      Sockets Connected in ${(socketTotalElapsed / 1000).toFixed(2)}s`);
  console.log(`      Connected: ${socketSuccess}/${validStudents.length} | Failed: ${socketFailed}`);
  console.log(`      Connect Latency (ms) -> Min: ${sockStats.min} | Avg: ${sockStats.avg} | P50: ${sockStats.p50} | P95: ${sockStats.p95} | P99: ${sockStats.p99} | Max: ${sockStats.max}`);

  // Step 5: Test Presenter Slide Change Broadcast Latency
  console.log(`\n[5/7] Testing Slide Change Broadcast to all ${socketSuccess} connected students...`);
  const slideTargetIndex = 3;
  let slideChangeReceived = 0;
  const slideChangeLatencies: number[] = [];
  const slideChangeStart = performance.now();

  const slidePromises = validStudents.map((student) => {
    if (!student.socket || !student.socket.connected) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const handler = (data: any) => {
        if (data.slideIndex === slideTargetIndex) {
          slideChangeLatencies.push(performance.now() - slideChangeStart);
          slideChangeReceived++;
          student.socket?.off("slide_updated", handler);
          resolve();
        }
      };
      student.socket?.on("slide_updated", handler);
      setTimeout(() => resolve(), 5000);
    });
  });

  // Admin emits slide change
  adminSocket.emit("admin:change_slide", {
    sessionCode,
    slideIndex: slideTargetIndex,
    buildStep: 0,
  });

  await Promise.all(slidePromises);
  const slideStats = stats(slideChangeLatencies);
  console.log(`      Slide Change received by ${slideChangeReceived}/${socketSuccess} students`);
  console.log(`      Broadcast Latency (ms) -> Min: ${slideStats.min} | Avg: ${slideStats.avg} | P50: ${slideStats.p50} | P95: ${slideStats.p95} | P99: ${slideStats.p99} | Max: ${slideStats.max}`);

  // Step 6: Test Live Quiz Surge (The Critical Stress Point)
  console.log(`\n[6/7] Simulating Live Quiz Launch & Concurrent Student Answer Surge...`);
  const quizSlideId = "slide_sanjauli_quiz_1";

  // Prepare all students to listen for quiz_started
  const quizReadyPromises = validStudents.map((student) => {
    if (!student.socket || !student.socket.connected) return Promise.resolve();
    return new Promise<void>((resolve) => {
      student.socket?.once("quiz_started", () => resolve());
      setTimeout(() => resolve(), 5000);
    });
  });

  // Admin starts quiz
  adminSocket.emit("admin:start_quiz", {
    sessionCode,
    slideId: quizSlideId,
    slideType: "QUIZ",
    timeLimit: 30,
  });

  await Promise.all(quizReadyPromises);
  console.log(`      Quiz started event received! Simulating students submitting answers...`);

  // Students submit responses (staggered across 1.5 seconds like real humans)
  const quizAckLatencies: number[] = [];
  let quizAckSuccess = 0;
  let quizAckFailed = 0;

  const quizSubmitStart = performance.now();
  const submissionPromises = validStudents.map((student, idx) => {
    if (!student.socket || !student.socket.connected) return Promise.resolve();
    return new Promise<void>(async (resolve) => {
      // Human-like stagger delay (0 to 1500ms)
      await sleep(Math.floor(Math.random() * 1500));

      const submitTime = performance.now();
      const optionIndex = idx % 4; // pick 0, 1, 2, or 3
      const isCorrect = optionIndex === 1;

      student.socket?.emit("audience:submit_response", {
        sessionCode,
        leadId: student.leadId,
        slideId: quizSlideId,
        slideType: "QUIZ",
        optionIndex,
        isCorrect,
      });

      const timeout = setTimeout(() => {
        quizAckFailed++;
        resolve();
      }, 7000);

      student.socket?.once("response_confirmed", () => {
        clearTimeout(timeout);
        const elapsed = performance.now() - submitTime;
        quizAckLatencies.push(elapsed);
        student.quizAckTimeMs = elapsed;
        quizAckSuccess++;
        resolve();
      });
    });
  });

  await Promise.all(submissionPromises);
  const quizTotalElapsed = performance.now() - quizSubmitStart;
  const quizStats = stats(quizAckLatencies);
  console.log(`      Quiz Submissions Finished in ${(quizTotalElapsed / 1000).toFixed(2)}s`);
  console.log(`      Acks Received: ${quizAckSuccess}/${socketSuccess} | Timed Out: ${quizAckFailed}`);
  console.log(`      Ack Latency (ms) -> Min: ${quizStats.min} | Avg: ${quizStats.avg} | P50: ${quizStats.p50} | P95: ${quizStats.p95} | P99: ${quizStats.p99} | Max: ${quizStats.max}`);

  // Step 7: Clean Up Test Session & Sockets
  console.log(`\n[7/7] Cleaning up ${validStudents.length} client sockets and test database data...`);
  for (const student of validStudents) {
    if (student.socket) {
      student.socket.disconnect();
    }
  }
  adminSocket.disconnect();

  // Purge test session and its leads from database
  try {
    await pool.query("DELETE FROM presentation_leads WHERE session_id = $1", [session.id]);
    await pool.query("DELETE FROM presentation_sessions WHERE id = $1", [session.id]);
    console.log(`      Purged test session [${sessionCode}] and test leads.`);
  } catch (cleanErr: any) {
    console.warn("      Warning cleaning up test session:", cleanErr.message);
  }

  // Final Summary Report
  console.log("\n=======================================================");
  console.log("               STRESS TEST SUMMARY REPORT              ");
  console.log("=======================================================");
  console.log(`Target Students:             ${STUDENT_COUNT}`);
  console.log(`HTTP Registration Success:   ${httpSuccess}/${STUDENT_COUNT} (${((httpSuccess / STUDENT_COUNT) * 100).toFixed(1)}%)`);
  console.log(`  - HTTP Avg Latency:        ${httpStats.avg} ms`);
  console.log(`  - HTTP P95 Latency:        ${httpStats.p95} ms`);
  console.log(`  - HTTP Max Latency:        ${httpStats.max} ms`);
  console.log(`WebSocket Connect Success:   ${socketSuccess}/${httpSuccess} (${((socketSuccess / (httpSuccess || 1)) * 100).toFixed(1)}%)`);
  console.log(`  - Socket Avg Latency:      ${sockStats.avg} ms`);
  console.log(`  - Socket P95 Latency:      ${sockStats.p95} ms`);
  console.log(`Slide Broadcast Delivery:    ${slideChangeReceived}/${socketSuccess} (${((slideChangeReceived / (socketSuccess || 1)) * 100).toFixed(1)}%)`);
  console.log(`  - Slide P95 Latency:       ${slideStats.p95} ms`);
  console.log(`Quiz Response Confirmed:     ${quizAckSuccess}/${socketSuccess} (${((quizAckSuccess / (socketSuccess || 1)) * 100).toFixed(1)}%)`);
  console.log(`  - Quiz P50 / P95 Latency:  ${quizStats.p50} ms / ${quizStats.p95} ms`);
  console.log(`  - Quiz Max Latency:        ${quizStats.max} ms`);

  const passed = httpSuccess === STUDENT_COUNT && socketSuccess >= STUDENT_COUNT * 0.98 && quizAckSuccess >= STUDENT_COUNT * 0.95;
  console.log(`\nOverall Test Result:         ${passed ? "✅ PASSED" : "⚠️ DEGRADED / FAILED"}`);
  console.log("=======================================================\n");

  await pool.end();
  process.exit(passed ? 0 : 1);
}

runStressTest().catch(async (e) => {
  console.error("Unhandled error during stress test:", e);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});

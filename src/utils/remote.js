import { exec } from "child_process";

export function sshRun(host, user, cmd) {
  return new Promise((resolve, reject) => {
    exec(
      `ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new ${user}@${host} '${cmd.replace(
        /'/g,
        "'\\''"
      )}'`,
      (err, stdout, stderr) => {
        if (err) reject(new Error(stderr || err.message));
        else resolve(stdout.trim());
      }
    );
  });
}
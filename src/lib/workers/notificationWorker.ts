// lib/workers/test.ts

async function loadNotifications() {
  const response = await fetch("/api/get-notifications", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const output = await response.json();

  return output;
}

onmessage = async (event: MessageEvent) => {
  const data = event.data?.message;
  try {
    const [notificationList] = await Promise.all([loadNotifications()]);
    const numberOfUnreadNotification = notificationList.filter(
      (item?) => !item?.readed,
    );
    const hasUnreadElement =
      numberOfUnreadNotification?.length !== 0 ? true : false;
    const output = {
      notificationList,
      hasUnreadElement,
      numberOfUnreadNotification,
    };

    postMessage({ message: "success", output });
  } catch (e) {
    postMessage({ message: "error", e });
  }
  // Sending data back to the main thread
  //postMessage({ message: 'Data received in the worker', ticker, apiURL });
};

export {};

async function createGroup(groupName) {
  try {
    const response = await fetch('http://localhost:8000/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group_name: groupName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
}

async function updateItem(itemId, updates) {
  try {
    const response = await fetch(`http://localhost:8000/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

async function getBill(Id) {
  try {
    const response = await fetch(`http://localhost:8000/bills/${Id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting bill:', error);
    throw error;
  }
}

export { createGroup, updateItem, getBill };
async function createGroup(groupName) {
  try {
    const response = await fetch('http://localhost:8000/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: groupName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    const data = await response.json();
    return data.groupId;
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

export { createGroup, updateItem };

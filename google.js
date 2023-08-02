const axios = require("axios");
const Excel = require("exceljs");

// Replace [MY_API_KEY] with your actual Google Maps API key
const apiKey = "MY_API_KEY";
const data = `AMD Transportation, LLC

American Club of Coplay, PA
American Fire Company #1
Amici IV
Andrew Gehris, DBA Obsidian Tattoo & Piercing Parlor
Avicenna Health,  LLC.
Beaver Meadows Borough
Beaver Meadows Volunteer Fire Co
Bill & Deb Renninger T/A Renninger's Garage
Blue Valley Rescue Squad
Blythe Township Municipal Authority
Borough of Lansford
Borough of McAdoo
Borough of Trappe
Bowmanstown Borough
Bushkill Township
Cascario's Inc.
Citizens Water Association of Deer Lake
Cope Jordan Inc DBA Kiddie Academy of Center Valley
Crosson Richetti & Daigle LLC
D & S Transportation LLC
East Bangor Borough and East Bangor Borough Municipal
Frank Murphy
Girardville Area Municipal Authority
Girardville Firefighters Relief Association
Hands and Feet LLC
Hillside GJD, LLC dba Hillside Mini Golf & Ice Cream
J K Miller Brothers Garage, LLC.
J.C. Health & Wellness Services
James Jacobs General Contracting, LLC.
Karen and Joseph Shustack
Karen Shustack 116 Cleveland Street Shenandoah, PA  17976
Keystone State Paving & Sealing Co
Kid's Express Inc.
Learning Circle LLC DBA Kiddie Academy of Feasterville
Learning Compass LLC DBA Kiddie Academy of Warminster
Learning Locomotion Inc.
Lehigh and Lausanne Volunteer Fire Co.
Lehigh Valley Meats, LLC.
Life Plasma Inc.
Mahanoy Area Boosters, Inc.
Mahanoy Township Authority
Mahanoy Township Board of Supervisors
Malapati Group, LLC
Mettam Brothers Lumber Company
Michelle Diane Brestowski
Mountain Valley Landscaping LLC
Narcis Gabriel Petre
Nesquehoning Borough Authority
North Bangor Volunteer Fire Company
Northeastern Schuylkill Joint Municipal Authority
Northern Schuylkill County Council of Government
Pet Brothers, Inc.
Pine Grove Ambulance Assoc.
Port Carbon Borough
Precision Home HealthCare, Inc., Precision Personal Care Inc., Precision Human Services Management
Pride Mobile Homes
Rarick Excavating Inc.
Renee Montagner dba Schuylkill Racquet & Fitness
Rizz Containers & Disposal LLC
Rizz Demolition LLC
Roseto Borough and Roseto Sewer Authority
Ryan Township
Schuylkill Community Education
Schuylkill Racquet Club
Shoemakersville Borough
Shoemakersville Fire Co #1
Siddhi Vinayak of New Castle, Inc. & Icchamani DE Inc
Specialized Productions, Inc.
St. Clair Borough
Stonybrook Home Sales of Hamburg LLC
Timothy Hill T/A Seasons Art Landscape Design
Tremont Area Ambulance Association
Upper Mount Bethel Township
Wayward Ink LLC, DBA Wayward Ink
Williams Well Drilling LLC
Wolff's Properties LLC
Ye Olde Spring Valley Tavern LLC`;

const businessNames = data.split("\n");
const results = [];

async function fetchPlaceDetails(name) {
  const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?key=${apiKey}&inputtype=textquery&input=${encodeURIComponent(
    name
  )}`;
  const response = await axios.get(findPlaceUrl);
  const data = response.data;
  if (data.status === "OK" && data.candidates.length > 0) {
    const placeId = data.candidates[0].place_id;
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?key=${apiKey}&place_id=${placeId}`;
    const detailsResponse = await axios.get(placeDetailsUrl);
    const detailsData = detailsResponse.data;
    if (detailsData.status === "OK") {
      const result = {
        name: name,
        address: detailsData?.result?.formatted_address || "",
        city:
          detailsData.result.address_components.find((comp) =>
            comp.types.includes("locality")
          )?.long_name || "",
        zipCode:
          detailsData.result.address_components.find((comp) =>
            comp.types.includes("postal_code")
          )?.long_name || "",
        phoneNumber: detailsData.result.formatted_phone_number || "",
      };
      results.push(result);
    }
  }
}

async function main() {
  for (const name of businessNames) {
    await fetchPlaceDetails(name);
  }

  // Create an Excel workbook and worksheet
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("Business Details");

  // Define headers for the columns
  worksheet.columns = [
    { header: "Name", key: "name", width: 30 },
    { header: "Address", key: "address", width: 40 },
    { header: "City", key: "city", width: 20 },
    { header: "Zip Code", key: "zipCode", width: 15 },
    { header: "Phone Number", key: "phoneNumber", width: 20 },
  ];

  // Add the data to the worksheet
  for (const result of results) {
    worksheet.addRow(result);
  }

  // Save the Excel file
  await workbook.xlsx.writeFile("business_details.xlsx");
  console.log("Excel file generated successfully.");
}

main().catch((error) => console.error("Error:", error));

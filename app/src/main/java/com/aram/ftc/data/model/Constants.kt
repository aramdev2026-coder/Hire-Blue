package com.aram.ftc.data.model

object AppConstants {
    val STATES_AND_DISTRICTS = mapOf(
        "Tamil Nadu" to listOf(
            "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
            "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai",
            "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
            "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni",
            "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
            "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
        ),
        "Andhra Pradesh" to listOf(
            "Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam",
            "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"
        ),
        "Karnataka" to listOf(
            "Bagalkot", "Bangalore Rural", "Bangalore Urban", "Belgaum", "Bellary", "Bidar",
            "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada",
            "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar",
            "Koppal", "Mandya", "Mysore", "Raichur", "Ramanagara", "Shimoga", "Tumkur", "Udupi",
            "Uttara Kannada", "Vijayapura", "Yadgir"
        ),
        "Kerala" to listOf(
            "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam",
            "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
        ),
        "Telangana" to listOf(
            "Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally",
            "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad",
            "Mahabubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda",
            "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy",
            "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal Rural", "Warangal Urban", "Yadadri Bhuvanagiri"
        ),
        "Puducherry" to listOf("Karaikal", "Mahe", "Puducherry", "Yanam"),
        "Maharashtra" to listOf(
            "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana",
            "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur",
            "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik",
            "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
            "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
        ),
        "Gujarat" to listOf(
            "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
            "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhumy Dwarka", "Gandhinagar", "Gir Somnath",
            "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada",
            "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat",
            "Surendranagar", "Tapi", "Vadodara", "Valsad"
        ),
        "Delhi" to listOf(
            "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
            "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
        )
    )

    val ALL_JOB_ROLES = listOf(
        "Agricultural Laborer", "Aircraft Mechanic", "Assembly Line Worker", "Assembly Technician",
        "Auto Body Repair Technician", "Auto Mechanic", "Automotive Painter", "Baker", "Blaster",
        "Boiler Operator", "Butcher", "CNC Machine Operator", "Carpenter", "Concrete Finisher",
        "Crane Operator", "Delivery Executive", "Diesel Mechanic", "Dispatcher", "Drilling Machine Operator",
        "Drywall Installer", "Dyeing Machine Operator", "Electrician", "Elevator Mechanic",
        "Embroidery Machine Operator", "Event Crew", "Fabric Cutter", "Facility Manager",
        "Farm Equipment Operator", "Fire and Safety Officer", "Fitter", "Fleet Maintenance Supervisor",
        "Forklift Operator", "Foundry Worker", "General Laborer", "Groundskeeper", "HVAC Technician",
        "Heavy Equipment Operator", "Heavy Truck Driver", "Housekeeper", "Industrial Electrician",
        "Industrial Painter", "Injection Molding Operator", "Inventory Clerk", "Ironworker",
        "Irrigation Technician", "Janitor", "Kitchen Helper", "Light Vehicle Driver", "Line Cook",
        "Loader / Unloader", "Logistics Coordinator", "Machinist", "Maintenance Technician",
        "Mason", "Material Handler", "Miner", "Packaging Operator", "Painter", "Picker and Packer",
        "Plumber", "Production Supervisor", "Quality Control Inspector", "Roofer", "Scaffolder",
        "Security Guard", "Sewing Machine Operator", "Site Supervisor", "Surveyor Assistant",
        "Tailor", "Tire Technician", "Tool and Die Maker", "Turner", "Waiter", "Warehouse Associate",
        "Weaver", "Welder"
    )

    val LANGUAGES = listOf(
        "Tamil", "English", "Hindi", "Malayalam", "Telugu", "Kannada", "Bengali", "Marathi",
        "Gujarati", "Punjabi", "Odia", "Assamese", "Urdu", "Sanskrit", "Konkani", "Kashmiri"
    )

    val SALARY_STEPS = listOf(
        10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000, 40000, 45000, 50000,
        60000, 70000, 80000, 90000, 100000, 120000, 150000, 180000, 200000, 220000, 250000, 275000, 300000,
        330000, 350000, 375000, 400000, 425000, 450000, 475000, 500000
    )

    val MARITAL_OPTIONS = listOf("Single", "Married", "Widowed", "Divorced")
    val GENDER_OPTIONS = listOf("Male", "Female", "Prefer not to say")

    val EDUCATION_LEVELS = listOf(
        "SSLC (10th) Pass", "HSC (12th) Pass", "ITI Pass", "Diploma Pass",
        "Any Degree / Graduate", "Post Graduate (PG)", "No Education Mandate"
    )

    val TN_COLLEGES = listOf(
        "Anna University, Chennai", "Madras University, Chennai", "Bharathiar University, Coimbatore",
        "Madurai Kamaraj University, Madurai", "Bharathidasan University, Tiruchirappalli",
        "Manonmaniam Sundaranar University, Tirunelveli", "Alagappa University, Karaikudi",
        "Annamalai University, Chidambaram", "Periyar University, Salem", "Thiruvalluvar University, Vellore",
        "Tamil Nadu Agricultural University (TNAU), Coimbatore", "Tamil Nadu Veterinary and Animal Sciences University (TANUVAS), Chennai",
        "Tamil Nadu Dr. M.G.R. Medical University, Chennai", "Tamil Nadu Dr. Ambedkar Law University, Chennai",
        "Tamil Nadu Physical Education and Sports University, Chennai", "Tamil University, Thanjavur",
        "Gandhigram Rural Institute, Dindigul", "Sathyabama Institute of Science and Technology, Chennai",
        "SRM Institute of Science and Technology, Chennai", "VIT University, Vellore",
        "Amrita Vishwa Vidyapeetham, Coimbatore", "SASTRA Deemed University, Thanjavur",
        "Kalasalingam Academy of Research and Education, Srivilliputhur", "Karunya Institute of Technology and Sciences, Coimbatore",
        "B.S. Abdur Rahman Crescent Institute of Science and Technology, Chennai", "Vinayaka Mission's Research Foundation, Salem",
        "Avinashilingam Institute for Home Science and Higher Education for Women, Coimbatore", "Loyola College, Chennai",
        "Madras Christian College (MCC), Chennai", "Presidency College, Chennai", "St. Joseph's College, Tiruchirappalli",
        "American College, Madurai", "PSG College of Arts and Science, Coimbatore", "Stella Maris College, Chennai",
        "Women's Christian College (WCC), Chennai", "Ethiraj College for Women, Chennai", "Bishop Heber College, Tiruchirappalli",
        "Jamal Mohamed College, Tiruchirappalli", "National College, Tiruchirappalli", "Government Arts College, Coimbatore",
        "Government Arts College, Salem", "Government Arts College, Kumbakonam", "Government Arts College, Nandanam, Chennai",
        "Queen Mary's College, Chennai", "Sacred Heart College, Tirupattur", "Sourashtra College, Madurai",
        "Thiagarajar College, Madurai", "Lady Doak College, Madurai", "Madura College, Madurai",
        "Sri Ramakrishna Mission Vidyalaya College of Arts and Science, Coimbatore", "Kongu Arts and Science College, Erode",
        "Vellalar College for Women, Erode", "Bishop Appasamy College of Arts and Science, Coimbatore",
        "Gobi Arts & Science College, Gobichettipalayam", "Ayya Nadar Janaki Ammal College, Sivakasi",
        "Standard Fireworks Rajaratnam College for Women, Sivakasi", "Sarah Tucker College, Tirunelveli",
        "St. Xavier's College, Palayamkottai", "Sadakathullah Appa College, Tirunelveli", "College of Engineering, Guindy (CEG), Chennai",
        "Madras Institute of Technology (MIT), Chromepet, Chennai", "Alagappa Chettiar Government College of Engineering and Technology, Karaikudi",
        "Government College of Technology (GCT), Coimbatore", "PSG College of Technology, Coimbatore",
        "Thiagarajar College of Engineering (TCE), Madurai", "Coimbatore Institute of Technology (CIT), Coimbatore",
        "Government College of Engineering, Salem", "Government College of Engineering, Tirunelveli",
        "Government College of Engineering, Bargur", "Government College of Engineering, Bodinayakkanur",
        "Government College of Engineering, Srirangam", "National Institute of Technology (NIT), Tiruchirappalli",
        "Indian Institute of Technology (IIT), Madras", "Kongu Engineering College, Erode", "Bannari Amman Institute of Technology, Sathyamangalam",
        "K.L.N. College of Engineering, Madurai", "Mepco Schlenk Engineering College, Sivakasi",
        "Sri Sivasubramaniya Nadar (SSN) College of Engineering, Chennai", "St. Joseph's College of Engineering, Chennai",
        "Rajalakshmi Engineering College, Chennai", "Easwari Engineering College, Chennai",
        "Sri Krishna College of Engineering and Technology, Coimbatore", "Kumaraguru College of Technology, Coimbatore",
        "Sona College of Technology, Salem", "Francis Xavier Engineering College, Tirunelveli",
        "National Engineering College, Kovilpatti", "PSNA College of Engineering and Technology, Dindigul",
        "Central Polytechnic College, Chennai", "Government Polytechnic College, Coimbatore", "Government Polytechnic College, Madurai",
        "Government Polytechnic College, Tiruchirappalli", "Government Polytechnic College, Tuticorin",
        "Government Polytechnic College, Nagercoil", "Government Polytechnic College, Krishnagiri",
        "PSG Polytechnic College, Coimbatore", "Murugappa Polytechnic College, Chennai",
        "Government Industrial Training Institute (ITI), Guindy, Chennai", "Government Industrial Training Institute (ITI), Coimbatore",
        "Government Industrial Training Institute (ITI), Madurai", "Government Industrial Training Institute (ITI), Trichy"
    )
}

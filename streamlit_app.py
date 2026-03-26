import streamlit as st
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key="AIzaSyCpRqGflbnNSexTjXHW4-i3BzF0_izGn2c")
model = genai.GenerativeModel("gemini-2.5-flash")

st.set_page_config(page_title="AI Phone Suggestion", layout="wide")

st.title("📱 AI Phone Recommendation")

st.markdown("Tell us your requirements and budget, and we'll suggest the best phones for you!")

# User input section
col1, col2 = st.columns(2)

with col1:
    budget = st.slider("Budget (₹)", min_value=5000, max_value=200000, value=30000, step=1000)
    use_case = st.selectbox(
        "Primary Use",
        ["General Use", "Gaming", "Photography", "Video Recording", "Business/Work", "Student", "Senior Citizen"]
    )

with col2:
    brand_preference = st.multiselect(
        "Preferred Brands",
        ["Samsung", "Apple", "OnePlus", "Xiaomi", "Realme", "Vivo", "Oppo", "Google", "Asus", "Nothing", "Any"],
        default=["Any"]
    )
    storage_needed = st.selectbox("Minimum Storage", ["64GB", "128GB", "256GB", "512GB", "1TB"])

# Additional requirements
st.subheader("Additional Requirements")
col3, col4 = st.columns(2)

with col3:
    camera_importance = st.slider("Camera Importance", 1, 10, 5)
    battery_life = st.selectbox("Battery Life Priority", ["Not Important", "Average", "Very Important"])

with col4:
    display_size = st.selectbox("Preferred Display Size", ["Small (5-6 inch)", "Medium (6-7 inch)", "Large (7+ inch)"])
    special_features = st.multiselect(
        "Must-have Features",
        ["5G", "Wireless Charging", "IP68 Water Resistant", "Expandable Storage", "Headphone Jack", "High Refresh Rate", "Face Unlock", "Fingerprint Sensor", "NFC", "Fast Charging"],
        default=[]
    )

# Performance and Design
st.subheader("Performance & Design")
col5 = st.columns(1)

with col5[0]:
    ram_requirement = st.selectbox("Minimum RAM", ["4GB", "6GB", "8GB", "12GB", "16GB+"])
    design_preference = st.multiselect(
        "Design Preferences",
        ["Slim Design", "Lightweight", "Premium Build", "Color Options", "Unique Design"],
        default=[]
    )

additional_notes = st.text_area("Any other specific requirements?", placeholder="e.g., Good for heavy gaming, long battery life, specific color preferences, etc.")

if st.button("🔍 Get AI Recommendations", type="primary"):
    if "Any" in brand_preference:
        brand_text = "any brand"
    else:
        brand_text = ", ".join(brand_preference)

    prompt = f"""
You are a smartphone expert. Based on the user's requirements, recommend 3-5 smartphones that best match their needs.

User Requirements:
- Budget: ₹{budget:,}
- Primary Use: {use_case}
- Preferred Brands: {brand_text}
- Minimum Storage: {storage_needed}
- Minimum RAM: {ram_requirement}
- Camera Importance: {camera_importance}/10
- Battery Life Priority: {battery_life}
- Display Size: {display_size}
- Must-have Features: {', '.join(special_features) if special_features else 'None specified'}
- Design Preferences: {', '.join(design_preference) if design_preference else 'None specified'}
- Additional Notes: {additional_notes if additional_notes else 'None'}

Please provide:
1. Top 3-5 phone recommendations within budget
2. For each phone: name, key specs (processor, RAM, storage, camera, battery, display), price, why it matches their needs
3. Pros and cons of each recommendation
4. Best overall pick with reasoning
5. Alternative options if budget allows

Consider these phone attributes in your recommendations:
- Performance (processor, RAM, gaming capabilities)
- Camera system (main, ultra-wide, telephoto, video recording)
- Battery life and charging speed
- Display quality and size
- Build quality and design
- Software updates and support
- Value for money
- Availability in India
- Current market prices

Be specific with current model names and realistic pricing. Focus on phones available in India.
"""

    try:
        with st.spinner("🤖 Analyzing your requirements and finding best phones..."):
            response = model.generate_content(prompt)

            st.success("🎉 Here are your personalized phone recommendations!")
            st.markdown("---")

            # Display the AI response in a nice format
            st.markdown(response.text)

            # Add some helpful follow-up
            st.markdown("---")
            st.info("💡 **Tip:** Prices may vary by retailer and location. Check current offers and read recent reviews before purchasing!")

    except Exception as e:
        st.error(f"❌ Error: {str(e)}")

st.markdown("---")
st.caption("Powered by Google Gemini 2.5 Flash | Made for Indian market")

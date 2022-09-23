<template>
    <div class="h-full">
        <!-- Header -->
        <div class="flex w-full justify-between  bg-gray-200 p-4">
            <p class=" text-black text-5xl" data-test="title">
                JNV Enable Test - Avanti Fellows
            </p>
        </div>
        <div class="flex flex-col items-center justify-center p-10">
            <p class="text-2xl pb-4">Registration Form</p>
            <FormKit
        type="form"
        :config="{ validationVisibility: 'submit' }"
        @submit="submitForm"
        >
        <FormKit
            type="text"
            label="*Name"
            validation="required|alpha_spaces|length:3,30"
            v-model="studentName"
            validation-visibility="live"
            name="name"
            help="Enter your full name. Example: Karn Mathur"
        />
        <FormKit
            type="select"
            label="*Gender"
            placeholder="Select your gender"
            :options="['Male', 'Female', 'Other']"
            validation="required"
            name="gender"
            help="Select your gender."
        />
        <FormKit
            type="date"
            label="*Date of Birth"
            validation="required|date_between:1990-01-01 00:00:00,2020-12-31 23:59:59"
            :validation-messages="{ date_between: 'Please enter date of birth in dd-mm-yyyy format' }"
            name="dob"
            help="Enter your date of birth. Example: 22-09-2000"
        />
        <FormKit
            type="text"
            label="*Father's Name"
            validation="required|alpha_spaces|length:3,30"
            name="father_name"
            validation-visibility="live"
            help="Enter your father's full name."
        />
        <FormKit
            type="text"
            label="*Mother's Name"
            validation="required|alpha_spaces|length:3,30"
            name="mother_name"
            validation-visibility="live"
            help="Enter your mother's full name."
        />
        <FormKit
            type="select"
            label="*Category"
            placeholder="Select your category"
            :options="['General', 'General-EWS', 'OBC', 'SC', 'ST']"
            validation="required"
            name="category"
            help="Select your category. Example: OBC"
        />
        <FormKit
            type="select"
            label="*Physically Handicapped"
            placeholder="Physically handicapped?"
            :options="['Yes', 'No']"
            validation="required"
            name="physically_handicapped"
            help="Please select Yes if you are physically handicapped"
        />
        <FormKit
            type="select"
            label="*Region"
            placeholder="Select your region"
            :options="['Bhopal', 'Lucknow', 'Chandigarh', 'Shillong', 'Pune', 'Patna', 'Hyderabad', 'Jaipur']"
            validation="required"
            name="region"
            help="Please select your JNV's region. Example: Shillong"
        />
        <FormKit
            type="select"
            label="*State"
            placeholder="Select your state"
            :options="states"
            validation="required"
            v-model="stateName"
            name="state"
            help="Please select your JNV's state. Example: Sikkim"
        />
        <FormKit
            type="text"
            label="*City"
            validation="required|alpha_spaces|length:3,30"
            name="city"
            help="Enter your city's name. Example: Hyderabad"
        />
        <FormKit
            type="select"
            label="*School Name"
            placeholder="Select your JNV's name"
            :options="jnvList || []"
            validation="required"
            name="school"
            help="Please select your JNV's name. Example: JNV Bidar"
        />
        <FormKit
            type="select"
            label="*Course"
            placeholder="Which course?"
            :options="['JEE', 'NEET']"
            validation="required"
            v-model="course"
            name="course"
            help="Please select your course: JEE or NEET"
        />
        <FormKit
            type="select"
            label="*Stream"
            placeholder="Select your stream"
            :options="['PCM', 'PCB', 'PCMB']"
            validation="required"
            name="stream"
            help="Please select your stream. Example: PCM (Physics, Chemistry, Math)"
        />
        <FormKit
            type="select"
            label="*Grade"
            placeholder="Select your grade"
            :options="['11', '12']"
            v-model="grade"
            validation="required"
            name="grade"
            help="Select 12 if you are in 12th grade/class"
        />
        <!-- We override validation-visibility for the input below: -->
        <FormKit
            type="tel"
            label="*Phone Number"
            validation="required|matches:/^[0-9]{10}$/"
            validation-visibility="live"
            v-model="phoneNumber"
            name="number"
            help="Please enter a valid mobile number. Example: 9848022335"
        />
        <FormKit
            type="select"
            label="*Primary SmartPhone Owner"
            placeholder="Who owns your phone?"
            :options="['Student', 'Father', 'Mother', 'Sibling', 'Other']"
            validation="required"
            name="primary_smartphone_owner"
            help="If you own the phone, select 'Student'.
            If your brother/sister owns the phone, select 'Sibling'"
        />
        <FormKit
            type="tel"
            label="*Family Income"
            validation="required|matches:/^[0-9]{5,8}$/"
            validation-visibility="live"
            name="family_income"
            help="Please enter your family income. (not sure what validation @suri)"
        />
        <FormKit
            type="select"
            label="*Guardian's Profession"
            placeholder="Select your guardian's profession"
            :options="['Government', 'Non Government', 'Daily Wage', 'Other']"
            validation="required"
            name="guardian_profession"
            help="If your father/mother/guardian work in a govt job, select 'Government'"
        />
        <FormKit
            type="select"
            label="*Guardian's Education Level"
            placeholder="Guardian's Education Level"
            :options="['Untutored', 'Under matriculation', 'Matriculation', 'Graduation', 'Post Graduation', 'Doctoral']"
            validation="required"
            name="guardian_education_level"
            help="If your father/mother/guardian studied till matriculation, select 'Matriculation'"
        />
            </FormKit>
        </div>
        </div>
  </template>

<script lang="ts">
// import axios, { AxiosRequestConfig, AxiosError, AxiosInstance } from "axios";
import { useRouter } from "vue-router";
import { defineComponent, reactive, toRefs, computed } from "vue";
import { jnvState } from "../assets/json/statesToJnv"
import FormDataAPI from "../services/API/FormInputHandling";

export default defineComponent({
  name: "FormInput",
  setup() {
    const router = useRouter();
    // const route = useRoute();

    const state = reactive({
      states: ['Andaman and Nicobar Islands U.T.', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh U.T.', 'Chhattisgarh',
        'Dadra & Nagar Haveli-U.T.', 'Daman & Diu U.T.', 'Delhi UT', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir',
        'Jharkhand', 'Karnataka', 'Kerala', 'LADAKH', 'Lakshadweep U.T.', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
        'Mizoram', 'Nagaland', 'Orissa', 'Pondicherry U.T.', 'Punjab', 'Rajasthan', 'Sikkim', 'Telangana', 'Tripura', 'Uttar Pradesh',
        'Uttarakhand', 'West Bengal'],
      course: "",
      grade: "",
      stateName: "",
      studentName: "",
      phoneNumber: ""
    });

    console.log(state.grade);

    const userId = computed(() => {
      return state.phoneNumber + "_" + state.studentName.replaceAll(" ", "");
    });

    const quizId = computed(() => {
      if (state.course == "JEE" && state.grade == "11") {
        return "632d54e1d7b622945cfd5ad5";
      } else if (state.course == "JEE" && state.grade == "12") {
        return "632d54ffd7b622945cfd5ae1"
      } else if (state.course == "NEET" && state.grade == "11") {
        return "632d5517d7b622945cfd5aed";
      } else {
        return "632d552cd7b622945cfd5af9";
      }
    });

    const jnvList = computed(() => {
      return jnvState[state.stateName];
    });

    // const submitForm = async (formData, node) => {
    //   try {
    //     await axios.post(formData)
    //     node.clearErrors()
    //   } catch (err: AxiosError) {
    //     node.setErrors(err.formErrors, err.fieldErrors);
    //   }
    // };

    const submitForm = async (formData : any) => {
      // check if good submission
      await FormDataAPI.submitFormData(formData);
      router.push({ name: 'Player', params: { quizId: quizId.value }, query: { userId: userId.value, apiKey: "6qOO8UdF1EGxLgzwIbQN" } })
    };

    return {
      ...toRefs(state),
      jnvList,
      quizId,
      userId,
      submitForm
    };
  },
});
</script>

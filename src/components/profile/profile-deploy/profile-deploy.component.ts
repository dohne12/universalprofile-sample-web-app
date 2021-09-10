import { formatNumber } from "@/helpers/ethers";
import { getLspFactory } from "@/services/lsp-factory.service";
import { LSP3ProfileJSON, DeploymentEvent } from "@lukso/lsp-factory.js";
import { defineComponent } from "vue";
import ProfileListIpfs from "@/components/profile/profile-list-ipfs/ProfileListIpfs.vue";
import { Contract } from "ethers";
import { getDeployedBaseContracts } from "@/helpers/deployment.helper";
import { getSigner } from "@/services/provider.service";

export default defineComponent({
  components: {
    ProfileListIpfs,
  },
  data() {
    return {
      isOwner: false,
      balance: "",
      selectedProfile: {},
      profileDeploymentEvents: [] as DeploymentEvent[],
      profileDeploymentEventsObj: {},
      status: {
        isLoading: false,
      },
    };
  },
  methods: {
    formatNumber,
    async createProfileOnChain(selectedProfile: {
      profile: LSP3ProfileJSON;
      url: string;
    }) {
      this.selectedProfile = selectedProfile;
      const signer = await getSigner();
      const network = await signer.provider.getNetwork();
      const networkDetails: any = await getDeployedBaseContracts(
        network.chainId
      );
      const lspFactory = await getLspFactory();

      console.log(networkDetails.baseContracts["LSP3Account"]["0.0.1"]);
      this.status.isLoading = true;
      lspFactory.LSP3UniversalProfile.deploy(
        {
          controllerAddresses: ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
          lsp3Profile: {
            json: selectedProfile.profile,
            url: selectedProfile.url,
          },
        },
        {
          libAddresses: {
            lsp3AccountInit:
              networkDetails.baseContracts["LSP3Account"]["0.0.1"],
            universalReceiverAddressStoreInit:
              networkDetails.baseContracts["UniversalReceiverAddressStore"][
                "0.0.1"
              ],
          },
        }
      ).subscribe({
        next: (deploymentEvent: DeploymentEvent) => {
          this.profileDeploymentEvents.push(deploymentEvent);
          console.log(deploymentEvent);
        },
        error: (error: Error) => {
          console.log(error);
          this.status.isLoading = false;
        },
        complete: () => {
          this.status.isLoading = false;
        },
      });
      return;
    },
  },
});